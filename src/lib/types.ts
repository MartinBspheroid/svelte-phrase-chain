// Recursive helper to generate dot-notation paths for all nodes
export type Paths<T, P extends string = ''> = T extends Readonly<Record<string, unknown>> // Is it an object-like structure?
    ? P extends '' // Handle root level keys separately
        ? { // Iterate over keys K at the root
              [K in keyof T & string]:
                  | K // The key itself is a path
                  | Paths<T[K], K>; // Recurse with K as the initial prefix
          }[keyof T & string]
        : T extends ReadonlyArray<unknown> // Is it an array?
            ? P // Stop at the array path itself
            : { // Iterate over keys K within the nested object
                  [K in keyof T & string]:
                      | `${P}.${K}` // Path to the nested key/node
                      | Paths<T[K], `${P}.${K}`>; // Recurse further
              }[keyof T & string]
    : P; // Leaf node or array reached, return the path built so far