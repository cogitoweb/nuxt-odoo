# 🚀 Nuxt Odoo Plugin

An advanced Nuxt 3 plugin for Odoo ERP integration that supports both **static mode** (`ssr: false`) and **server mode** (`ssr: true`).

## ✨ Features

- 🔄 **Adaptive Mode**: Works automatically with both static and server-side builds
- 🔐 **Complete Authentication**: Login/logout with session management
- 📡 **Complete API**: All Odoo methods (CRUD, readGroup, searchRead, etc.)
- 🛡️ **Error Handling**: Automatic handling of expired sessions
- 🎯 **Type Safety**: Full TypeScript support
- ⚡ **Performance**: Optimized for both deployment modes

## 📦 Installation

```bash
npm install nuxt-odoo
```

## ⚙️ Configuration

### 1. Add the module to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    'nuxt-odoo'
  ],
  odooRpc: {
    baseUrl: process.env.BASE_URL,    // Odoo server URL
    dbName: process.env.DB_NAME,      // Odoo database name
  },
  ssr: false, // For static mode (optional)
})
```

### 2. Environment variables (`.env`):

```env
BASE_URL=https://your-odoo-server.com
DB_NAME=your-database-name
```

## 🎯 Basic Usage

### Authentication

```typescript
// pages/login.vue
<script setup>
const { $odoo } = useNuxtApp()

const login = async () => {
  try {
    const result = await $odoo.login('database', 'username', 'password')
    localStorage.setItem('session_id', result.session_id)
    // Login successful
  } catch (error) {
    // Error handling
  }
}
</script>
```

### CRUD Operations

```typescript
// Service example
const userService = {
  // Search and read
  getUsers: async () => {
    return await $odoo.searchRead('res.users', {
      domain: [['active', '=', true]],
      fields: ['name', 'email', 'login']
    })
  },

  // Create
  createUser: async (userData) => {
    return await $odoo.create('res.users', userData)
  },

  // Update
  updateUser: async (userId, userData) => {
    return await $odoo.write('res.users', userId, userData)
  },

  // Delete
  deleteUser: async (userId) => {
    return await $odoo.unlink('res.users', userId)
  }
}
```

### Aggregations with readGroup

```typescript
// Example for dashboard/analytics
const dashboardService = {
  getStats: async () => {
    return await $odoo.readGroup('sale.order', [], {
      groupby: ['state', 'date_order:month'],
      fields: ['amount_total', 'state'],
      domain: [['date_order', '>=', '2024-01-01']],
      lazy: false
    })
  }
}
```

## 🔧 Complete API

### Authentication Methods
- `login(db, username, password)` - User authentication
- `logout()` - User logout
- `isLoggedIn()` - Check login status
- `sendSession(sessionId)` - Initialize existing session

### CRUD Methods
- `create(model, data, params)` - Create record
- `read(model, ids, params)` - Read record
- `write(model, ids, data, params)` - Update record
- `unlink(model, ids, params)` - Delete record

### Search Methods
- `search(model, params)` - Search IDs
- `searchRead(model, params)` - Search and read
- `searchCount(model, params)` - Count results

### Advanced Methods
- `readGroup(model, args, kwargs)` - Aggregations
- `fieldsGet(model, params)` - Field metadata
- `call(model, method, args, kwargs)` - Custom calls

## 🏗️ Operating Modes

### 📱 Static Mode (`ssr: false`)
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,  // Generate static files
  // ... rest of configuration
})
```

**Features:**
- ✅ Deploy on CDN/static hosting
- ✅ Direct calls to Odoo web APIs
- ✅ Client-side session management
- ✅ High performance

### 🖥️ Server Mode (`ssr: true`)
```typescript
// nuxt.config.ts  
export default defineNuxtConfig({
  ssr: true,  // Server-side rendering
  // ... rest of configuration
})
```

**Features:**
- ✅ SEO optimized
- ✅ Nuxt server handlers
- ✅ Server-side session management
- ✅ Advanced security

## 🎨 Practical Examples

### Dashboard with Charts

```typescript
// composables/useProductionStats.ts
export function useProductionStats() {
  const { $odoo } = useNuxtApp()
  
  const getProductionData = async () => {
    return await $odoo.readGroup('production.order', [], {
      groupby: ['state', 'date_planned:day'],
      fields: ['product_qty', 'state'],
      domain: [['date_planned', '>=', useTodayDate()]],
      lazy: false
    })
  }
  
  return { getProductionData }
}
```

### Inventory Management

```typescript
// services/inventoryService.ts
const inventoryService = {
  getStock: async (locationId) => {
    return await $odoo.searchRead('stock.quant', {
      domain: [['location_id', '=', locationId]],
      fields: ['product_id', 'quantity', 'reserved_quantity']
    })
  },

  moveStock: async (productId, fromLocation, toLocation, quantity) => {
    return await $odoo.call('stock.move', 'create_and_confirm', [], {
      product_id: productId,
      location_id: fromLocation,
      location_dest_id: toLocation,
      product_uom_qty: quantity
    })
  }
}
```

## 🚨 Error Handling

```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  if(process.server) return

  const sessionId = window.localStorage.getItem('session_id')

  if (sessionId && to?.name === 'login') {
    return navigateTo('/')
  }

  if (!sessionId && to?.name !== 'login') {
    abortNavigation()
    return navigateTo('/login')
  }
})
```

## 📚 Advanced Documentation

### Custom Context
```typescript
// Pass custom context
await $odoo.searchRead('res.partner', {
  domain: [],
  fields: ['name'],
  context: { lang: 'it_IT', tz: 'Europe/Rome' }
})
```

### Pagination
```typescript
// Paginated search
await $odoo.searchRead('product.product', {
  domain: [['sale_ok', '=', true]],
  fields: ['name', 'list_price'],
  offset: 0,
  limit: 50,
  order: 'name ASC'
})
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

- Based on [odoo-jsonrpc-extended](https://github.com/OdooRPC/odoo-jsonrpc-extended)
- Compatible with Nuxt 3
- Supports Odoo 15+

---

**Made with ❤️ for the Odoo & Nuxt communities**