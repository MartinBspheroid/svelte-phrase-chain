import { z } from 'zod';

// --- Configuration Options ---

interface I18nSchemaOptions {
  /**
   * How to identify keys that should represent pluralized objects.
   * - Provide an array of explicit key names: `['messageCount', 'itemCount']`
   * - Provide a function: `(key: string) => key.endsWith('Count')` (use with caution)
   * - Default: No keys are treated as plural by default unless specified.
   */
  pluralKeyIdentifier: string[] | ((key: string) => boolean);

  /**
   * Plural categories required for objects identified by `pluralKeyIdentifier`.
   * @default ['one', 'other']
   */
  requiredPluralKeys?: string[];

  /**
   * Optional plural categories allowed for objects identified by `pluralKeyIdentifier`.
   * Use this for language-specific rules (e.g., 'zero', 'two', 'few', 'many').
   * @default ['zero', 'two', 'few', 'many'] (Common additions)
   */
  optionalPluralKeys?: string[];

  /**
   * Allowed format identifiers within {date:xxx} placeholders.
   * @default ['date', 'relative']
   */
  allowedDateFormats?: string[];

   /**
   * If true, validates the syntax of all placeholders like {placeholder_name}.
   * Checks if the name inside {} contains only alphanumeric characters and underscores.
   * @default false
   */
   validateAllPlaceholdersSyntax?: boolean;
}

// --- Helper Functions ---

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// --- Recursive JSON Value Schema (Stricter Base) ---

// Define a base type for allowed JSON values
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Zod schema for basic JSON structure validation
const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

// --- Main Schema Creation Function ---

export function createI18nSchema(options: I18nSchemaOptions) {
  // --- Set Defaults for Options ---
  const resolvedOptions = {
    requiredPluralKeys: options.requiredPluralKeys ?? ['one', 'other'],
    optionalPluralKeys: options.optionalPluralKeys ?? ['zero', 'two', 'few', 'many'],
    allowedDateFormats: options.allowedDateFormats ?? ['date', 'relative'],
    validateAllPlaceholdersSyntax: options.validateAllPlaceholdersSyntax ?? false,
    pluralKeyIdentifier: options.pluralKeyIdentifier // Required option
  };

  const allAllowedPluralKeys = new Set([
      ...resolvedOptions.requiredPluralKeys,
      ...resolvedOptions.optionalPluralKeys
  ]);

  // --- Recursive Validation Logic ---
  const checkI18nNode = (node: unknown, ctx: z.RefinementCtx, path: (string | number)[]): void => {
    if (typeof node === 'string') {
      // ... (placeholder validation logic remains the same) ...
      const placeholderRegex = /{([a-zA-Z0-9_]+)}/g;
      const datePlaceholderRegex = /{date:([a-zA-Z0-9_]+)}/g;
      let match;
      datePlaceholderRegex.lastIndex = 0; // Reset regex state
      while ((match = datePlaceholderRegex.exec(node)) !== null) {
        const format = match[1];
        if (!resolvedOptions.allowedDateFormats.includes(format)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid date format placeholder '{date:${format}}'. Allowed formats: ${resolvedOptions.allowedDateFormats.join(', ')}.`,
            path: path,
          });
        }
      }
      if (resolvedOptions.validateAllPlaceholdersSyntax) {
          placeholderRegex.lastIndex = 0; // Reset regex state
          // You might want a more robust check here to find *any* invalid syntax,
          // not just validate the format of correctly formed ones.
          // Example: Check if node.match(/\{[^{}]*[^a-zA-Z0-9_{}][^{}]*\}/) exists
          while ((match = placeholderRegex.exec(node)) !== null) {
              // Current logic only validates syntax of matched valid placeholders
          }
      }

    } else if (isPlainObject(node)) {
      // --- Object Node ---
      for (const [key, value] of Object.entries(node)) {
        const currentPath = [...path, key];
        let isPluralKey = false;
        if (typeof resolvedOptions.pluralKeyIdentifier === 'function') {
            isPluralKey = resolvedOptions.pluralKeyIdentifier(key);
        } else {
            isPluralKey = resolvedOptions.pluralKeyIdentifier.includes(key);
        }

        if (isPluralKey) {
          // --- Pluralization Object Validation ---
          if (!isPlainObject(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Key "${key}" was identified as a plural key, so its value must be an object. Found: ${typeof value}`,
              path: currentPath,
            });
            continue; // Don't process children if the structure is wrong
          }

          const pluralKeysPresent = Object.keys(value);

          // Check for required plural keys first
          const missingKeys = resolvedOptions.requiredPluralKeys.filter(k => !(k in value));
          if (missingKeys.length > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Pluralization object for key "${key}" is missing required categories: ${missingKeys.join(', ')}.`,
              path: currentPath,
            });
            // Don't necessarily continue here, as other keys might still be invalid
          }

          // Now check each present key for validity and type
          for (const pluralKey of pluralKeysPresent) {
             const pluralValuePath = [...currentPath, pluralKey];

             // Check 1: Is the plural category key itself allowed?
             if (!allAllowedPluralKeys.has(pluralKey)) {
                 ctx.addIssue({
                     code: z.ZodIssueCode.custom,
                     message: `Invalid plural category "${pluralKey}" found for key "${key}". Allowed categories: ${[...allAllowedPluralKeys].join(', ')}.`,
                     path: pluralValuePath,
                 });
                 // *** FIX: Added continue ***
                 continue; // Stop processing this specific invalid key
             }

             // Check 2: If the key is allowed, is its value a string?
             if (typeof value[pluralKey] !== 'string') {
                 ctx.addIssue({
                     code: z.ZodIssueCode.custom,
                     message: `Pluralization value for category "${pluralKey}" (under key "${key}") must be a string. Found: ${typeof value[pluralKey]}`,
                     path: pluralValuePath,
                 });
                  // *** FIX: Added continue ***
                 continue; // Stop processing this key if its value type is wrong
             }

             // If key is allowed AND value is string, recurse to check content (e.g., placeholders)
             checkI18nNode(value[pluralKey], ctx, pluralValuePath);
          }
          // Skip normal recursion for the *plural object itself* after checking its keys/values
          continue; // Added this to be explicit, though logic flow might already achieve it

        } else {
          // --- Regular Object Key -> Recurse ---
          checkI18nNode(value, ctx, currentPath);
        }
      }
    } else if (Array.isArray(node)) {
      // --- Array Node -> Recurse on Elements ---
      node.forEach((element, index) => {
        checkI18nNode(element, ctx, [...path, index]);
      });
    }
  }; 



  // --- The Final Schema ---
  return z.record(z.string(), jsonValueSchema) // Base schema: object with string keys and valid JSON values
    .superRefine((data, ctx) => {
      // Start the recursive validation check from the root object
      checkI18nNode(data, ctx, []);
    });
}

// --- Example Usage ---

// 1. Define your i18n data
const i18nData = {
  "common": {
      "greeting": "Hello {name}!",
      "todayIs": "Today is {date:date}"
   },
  "user": {
    "profile": "User Profile",
    "joinDate": "Member since {date:fullDate}", // Example custom date format
    "lastLogin": "Last login: {date:relative}",
    "followerCount": { // Identified as plural by the function below
      "zero": "No followers",
      "one": "{count} follower",
      "other": "{count} followers",
      // "few": "{count} followers (few)" // Allowed by optional keys
    },
    "messageCount": { // Also identified as plural
      "one": "You have {count} unread message",
      "other": "You have {count} unread messages",
      // Missing 'zero' - will error if 'zero' is required
    },
    "items": [
        "Item {itemId}",
        { "detail": "Detail for {detailId}"}
    ]
  },
  // --- Invalid Data Examples ---
//   "invalidDate": "Created {date:timestamp}", // Invalid date format 'timestamp'
//   "viewCount": { // Invalid: Missing 'one' (if required)
//      "other": "{count} views"
//   },
//   "likeCount": "5 likes", // Invalid: If identified as plural, needs to be an object
//   "commentCount": { // Invalid: Value for 'one' is not a string
//      "one": 1,
//      "other": "{count} comments"
//   },
//   "invalidPlaceholder": "Value is {invalid-char}", // Invalid placeholder syntax (if validateAllPlaceholdersSyntax=true)
//   "anotherPlural": { // Invalid: Contains disallowed plural key 'many' (if not in optional)
//       "one": "1",
//       "other": "others",
//       "many": "lots"
//   }
};


// 2. Create the schema with specific options
export const myI18nSchema = createI18nSchema({
    pluralKeyIdentifier: (key) => key.endsWith('Count'), // Identify plurals by suffix
    // pluralKeyIdentifier: ['followerCount', 'messageCount'], // Alternative: Explicit list

    requiredPluralKeys: ['one', 'other'], // English basic requirements
    optionalPluralKeys: ['zero'],        // Allow 'zero' but don't require it

    allowedDateFormats: ['date', 'relative', 'fullDate'], // Allow our custom 'fullDate'

    validateAllPlaceholdersSyntax: true // Check syntax like {name}, {itemId} etc.
});

// 3. Validate the data
try {
  const validatedData = myI18nSchema.parse(i18nData);
  console.log("Validation successful!");
  // console.log(validatedData);

  // IMPORTANT: Type safety after validation still relies on a separate TS type.
  // The type of `validatedData` is still inferred from the base Zod schema,
  // not the detailed structure confirmed by superRefine.
  // Use the `Paths` type definition from previous examples for usage type safety.
  // Example: const typedData = validatedData as unknown as YourI18nType;

} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Validation failed:");
    console.error(JSON.stringify(error.errors, null, 2));
  } else {
    console.error("An unexpected error occurred:", error);
  }
}