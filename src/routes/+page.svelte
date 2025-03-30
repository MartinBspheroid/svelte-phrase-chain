<script lang="ts">
    import { t, setLocale, locale, initLocale } from '$lib/i18n.svelte';
    import Translation from './components/translation.svelte';
	import type { Locale } from '$lib/i18n.svelte';
    
    // Initialize with browser detection
    initLocale({ preferBrowser: true, preferStorage: true });
    
    // User data for demos
    let userName = $state("Alex")
    let followerCount = $state(1);
    let messageCount = $state(0);
    let purchaseCount = $state(5);
    
    // For current date demonstrations
    const joinDate = new Date('2024-01-15');
    const lastLoginDate = new Date(Date.now() - 3600000); // 1 hour ago
    
    // Toggle values for demo
    function incrementFollowers() {
      followerCount++;
    }
    
    function incrementMessages() {
      messageCount++;
    }

    $inspect(messageCount)
    
    function resetCounts() {
      followerCount = 0;
      messageCount = 0;
      purchaseCount = 0;
    }
    
    // Available locales
    const locales = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'cs', name: 'Čeština' }
    ];
    
    function changeLocale(code: Locale) {
      setLocale(code);
    }
  </script>
  
  <main>
    <header>
      <h1 class="title">{t('common.welcome')}</h1>
      <p class="subtitle">{t('common.greeting', { name: userName })}</p>
      
      <div class="language-selector">
        <p><Translation key="user.language" tag="span" />:</p>
        <div class="locale-buttons">
          {#each locales as { code, name }}
            <button 
              class={locale() === code ? 'active' : ''} 
              onclick={() => changeLocale(code as Locale)}
            >
              {name}
            </button>
          {/each}
        </div>
      </div>
    </header>
    
    <section class="demo-section">
      <h2>Translation Features Demo</h2>
      
      <div class="card">
        <h3>1. Basic Text Translation</h3>
        <div class="examples">
          <p>Using t() function: <strong>{t('nav.home')}</strong>, <strong>{t('nav.products')}</strong>, <strong>{t('nav.settings')}</strong></p>
          <p>Using component: <strong><Translation key="auth.login" /></strong>, <strong><Translation key="auth.signup" /></strong></p>
        </div>
      </div>
      
      <div class="card">
        <h3>2. Parameter Replacement</h3>
        <div class="examples">
          <p>{t('auth.loginSuccess', { name: userName })}</p>
          <p>{t('errors.passwordLength', { length: 8 })}</p>
          <p>{t('products.rating', { rating: 4.5 })}</p>
        </div>
      </div>
      
      <div class="card">
        <h3>3. Date Formatting</h3>
        <div class="examples">
          <p>{t('user.joinDate', { date: joinDate })}</p>
          <p>{t('user.lastLogin', { date: lastLoginDate })}</p>
        </div>
      </div>
      
      <div class="card">
        <h3>4. Pluralization</h3>
        <div class="examples">
          <div class="counter-demo">
            <p>{t('user.followerCount', { count: followerCount }, followerCount)}</p>
            <button onclick={incrementFollowers}>+1 Follower</button>
          </div>
          
          <div class="counter-demo">
            
            <p>
              {t('user.messageCount', { count: messageCount }, messageCount)}
            </p>
            <button onclick={incrementMessages}>+1 Message</button>
          </div>
          
          <div class="counter-demo">
            <p>{t('products.addToCart', { count: purchaseCount }, purchaseCount)}</p>
            <p>{t('products.addToCart', )}</p>
          </div>
          
          <button onclick={resetCounts}>Reset All Counts</button>
        </div>
      </div>
      
      <div class="card">
        <h3>5. Nested Keys</h3>
        <div class="examples">
          <h4><Translation key="user.address.title" /></h4>
          <p>
            <Translation key="user.address.street" />: 123 Main St<br>
            <Translation key="user.address.city" />: New York<br>
            <Translation key="user.address.postalCode" />: 10001<br>
            <Translation key="user.address.country" />: USA
          </p>
        </div>
      </div>
    </section>
    
    <section class="buttons-section">
      <h3>Action Buttons</h3>
      <div class="action-buttons">
        <button>{t('common.actions.save')}</button>
        <button>{t('common.actions.cancel')}</button>
        <button>{t('common.actions.edit')}</button>
        <button>{t('common.actions.delete')}</button>
        <button>{t('common.actions.confirm')}</button>
      </div>
    </section>
    
    <section class="error-section">
      <h3>Error Messages</h3>
      <div class="error-messages">
        <p class="error">{t('errors.notFound')}</p>
        <p class="error">{t('errors.serverError')}</p>
        <p class="error">{t('errors.networkError')}</p>
        <p class="error">{t('errors.validationError')}</p>
      </div>
    </section>
    
    <footer>
      <p>{t('common.footer')}</p>
      <p><Translation key="common.loading" /></p>
    </footer>
  </main>
  
  <style>
    main {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eaeaea;
    }
    
    .title {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .subtitle {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 1.5rem;
    }
    
    .language-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .locale-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    button {
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    button:hover {
      background-color: #f0f0f0;
    }
    
    button.active {
      background-color: #4a76fb;
      color: white;
      border-color: #2b52d3;
    }
    
    .demo-section {
      margin-bottom: 2rem;
    }
    
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .card h3 {
      margin-top: 0;
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      color: #333;
    }
    
    .examples {
      margin-top: 1rem;
    }
    
    .counter-demo {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .counter-demo p {
      min-width: 250px;
    }
    
    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .error-messages {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .error {
      color: #e53935;
      padding: 0.5rem;
      border-radius: 4px;
      background-color: rgba(229, 57, 53, 0.1);
    }
    
    footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #eaeaea;
      text-align: center;
      color: #666;
    }
    
    @media (max-width: 768px) {
      main {
        padding: 1rem;
      }
      
      .language-selector {
        flex-direction: column;
      }
    }
  </style>