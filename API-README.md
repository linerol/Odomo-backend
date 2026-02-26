# Odomo Backend API Documentation

This document serves as a comprehensive reference for the Odomo Backend API. It is designed to be as exhaustive as a Swagger specification, detailing all available endpoints, required request structures, expected responses, and potential errors.

## Base URL
All endpoints are relative to the server's base URL (e.g., `http://localhost:3000`).

## Authentication
Most endpoints require authentication via a JWT token.
Include the token in the `Authorization` header of your HTTP requests:
```http
Authorization: Bearer <your_jwt_token>
```
Endpoints that do NOT require authentication are explicitly marked as **Public**.

---

## Shared Models

### Enums

#### `Stage`
- `TAMAGO`
- `CHIBI`
- `GENIN`
- `CHUNIN`
- `JONIN`
- `KAGE`

#### `LifeState`
- `ALIVE`
- `SICK`
- `DEAD`

#### `ItemType`
- `ONIGIRI`
- `RAMEN`
- `BENTO_ROYAL`
- `SOAP`
- `MEDICINE`
- `SOUL_STONE`
- `CANDY`
- `PLUSH_TOY`
- `SPONGE`
- `BUBBLE_BATH`
- `ENERGY_DRINK`

#### `InteractionType`
- `FEED`
- `CLEAN`
- `HEAL`

### DTOs & Entities

#### `SignupDto`
```json
{
  "email": "user@example.com", 
  "password": "password123"    
}
```

#### `SigninDto`
```json
{
  "email": "user@example.com", 
  "password": "password123"    
}
```

#### `CreateUserDto`
```json
{
  "email": "user@example.com",     
  "password": "password123",       
  "hasSeenOnboarding": false,
  "stepGoal": 10000,
  "avatar": "avatar_1.png"
}
```

#### `UpdateUserDto`
All properties are optional (Partial of `CreateUserDto`).
```json
{
  "email": "new@example.com",     
  "password": "newpassword123",       
  "hasSeenOnboarding": true,
  "stepGoal": 8000,
  "avatar": "avatar_2.png"
}
```

#### `BuyItemDto`
```json
{
  "itemType": "ONIGIRI", 
  "quantity": 1          
}
```
*Note: `itemType` must be a valid `ItemType` enum value.*

#### `UseItemDto`
```json
{
  "itemType": "ONIGIRI" 
}
```
*Note: `itemType` must be a valid `ItemType` enum value.*

#### `CreateOdomoDto`
```json
{
  "name": "My Odomo" 
}
```

#### `InteractDto`
```json
{
  "type": "FEED", 
  "amount": 30    
}
```
*Note: `type` must be a valid `InteractionType` enum value.*

#### `SyncStepsDto`
```json
{
  "steps": 5000 
}
```

### `UserEntity`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "kobanBalance": 0,
  "stepGoal": 10000,
  "streak": 14,
  "totalSteps": 245800,
  "avatar": "avatar_1.png",
  "createdAt": "2023-11-20T12:00:00.000Z",
  "updatedAt": "2023-11-20T12:00:00.000Z",
  "hasSeenOnboarding": false
}
```

### `OdomoStatsDto`
```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "level": 1,
  "xp": 0,
  "maxXp": 100,
  "stage": "string",
  "evolutionVariant": "string | null",
  "hunger": 100,
  "happiness": 100,
  "hygiene": 100,
  "lifeState": "string",
  "birthDate": "2023-11-20T12:00:00.000Z",
  "lastInteractionAt": "2023-11-20T12:00:00.000Z",
  "lastStepSyncAt": "2023-11-20T12:00:00.000Z",
  "timeSinceLastInteraction": 0,
  "needsAttention": false,
  "isSick": false,
  "isDead": false
}
```

### `SyncResponseDto`
```json
{
  "xpGained": 50,
  "kobansGained": 10,
  "newKobanBalance": 110,
  "odomo": { /* OdomoStatsDto */ },
  "leveledUp": false,
  "stageEvolved": false
}
```

### Database Models (Prisma)

#### `User`
```prisma
model User {
  id                String          @id @default(uuid())
  email             String          @unique
  password          String
  kobanBalance      Int             @default(0)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  odomo             Odomo?
  inventory         InventoryItem[]
  hasSeenOnboarding Boolean         @default(false)
}
```

#### `Odomo`
```prisma
model Odomo {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name              String    @default("Odomo")
  level             Int       @default(1)
  xp                Int       @default(0)
  stage             Stage     @default(TAMAGO)
  evolutionVariant  String?
  hunger            Float     @default(100)
  happiness         Float     @default(100)
  hygiene           Float     @default(100)
  lifeState         LifeState @default(ALIVE)
  birthDate         DateTime  @default(now())
  lastInteractionAt DateTime  @default(now()) // Pour la règle des 16h
  lastStepSyncAt    DateTime  @default(now()) // Pour le podomètre
}
```

#### `InventoryItem`
```prisma
model InventoryItem {
  id       String   @id @default(uuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id])
  itemType ItemType
  quantity Int      @default(1)

  @@unique([userId, itemType])
}
```

---

## Endpoints

### 🟢 Application (Health)
#### `GET /`  *(Public)*
Check application status.
- **Responses:**
  - `200 OK`: Returns a greetings message or status.

---

### 🔐 Auth
Authentication related endpoints.

#### `POST /auth/signup` *(Public)*
Register a new user.
- **Request Body (`SignupDto`):**
  ```json
  {
    "email": "user@example.com", 
    "password": "password123"    
  }
  ```
  - `email`: Required, must be a valid email address.
  - `password`: Required, minimum length 8 characters.
- **Responses:**
  - `201 Created`: The user has been successfully created.
  - `400 Bad Request`: Validation error (invalid email, short password, etc.).
  - `409 Conflict`: Email already exists.

#### `POST /auth/signin` *(Public)*
Login an existing user to receive an auth token.
- **Request Body (`SigninDto`):**
  ```json
  {
    "email": "user@example.com", 
    "password": "password123"    
  }
  ```
  - `email`: Required, must be a valid email address.
  - `password`: Required.
- **Responses:**
  - `200 OK`: User successfully logged in. Returns the authentication token (usually `{ access_token: "..." }`).
  - `401 Unauthorized`: Invalid credentials.
  - `400 Bad Request`: Validation error.

---

### 👤 Users
User management endpoints.

#### `POST /users` *(Auth Required)*
Create a new user manually.
- **Request Body (`CreateUserDto`):**
  ```json
  {
    "email": "user@example.com",     
    "password": "password123",       
    "hasSeenOnboarding": false,
    "stepGoal": 10000,
    "avatar": "avatar_1.png"
  }
  ```
  - `email`: Required, must be a valid email.
  - `password`: Required, minimum length 8.
  - `hasSeenOnboarding`: Optional boolean.
  - `stepGoal`: Optional number (min 1000, max 100000). Default is 10000.
  - `avatar`: Optional string representing the chosen avatar.
- **Responses:**
  - `201 Created`: Returns `UserEntity` representing the created user.
  - `400 Bad Request`: Validation errors.

#### `GET /users/me` *(Auth Required)*
Get the currently logged-in user's profile.
- **Responses:**
  - `200 OK`: Returns the current `UserEntity`.
  - `401 Unauthorized`: Unauthorized access (invalid or missing JWT token).

#### `GET /users` *(Auth Required)*
Get all registered users.
- **Responses:**
  - `200 OK`: Returns an array of `UserEntity` objects.
  - `401 Unauthorized`: Unauthorized access.

 

#### `PATCH /users/me` *(Auth Required)*
Update the currently logged-in user's profile.
- **Request Body (Partial `UpdateUserDto`):**
  All fields are optional.
  ```json
  {
    "email": "new@example.com",
    "password": "newpassword123",
    "hasSeenOnboarding": true,
    "stepGoal": 8000,
    "avatar": "avatar_2.png"
  }
  ```
- **Responses:**
  - `200 OK`: The user was successfully updated. Returns the updated `UserEntity`.
  - `400 Bad Request`: Validation error.
  - `404 Not Found`: User not found.

#### `DELETE /users/me` *(Auth Required)*
Delete the currently logged-in user's account.
- **Responses:**
  - `200 OK`: The user has been successfully deleted. Returns the deleted `UserEntity`.
  - `404 Not Found`: User not found.

---

### 🎒 Inventory
Item and inventory management endpoints for the logged-in user.

#### `GET /inventory/shop` *(Auth Required)*
Get the full shop catalog with all available items, prices, effects, descriptions, and categories.
- **Responses:**
  - `200 OK`: Returns an array of shop items.
  ```json
  [
    {
      "itemType": "ONIGIRI",
      "price": 10,
      "effects": { "hunger": 20 },
      "description": "A simple rice ball. Restores a bit of hunger.",
      "category": "food"
    },
    {
      "itemType": "RAMEN",
      "price": 25,
      "effects": { "hunger": 40, "happiness": 10 },
      "description": "A warm bowl of ramen. Fills the belly and lifts the spirit.",
      "category": "food"
    },
    {
      "itemType": "BENTO_ROYAL",
      "price": 50,
      "effects": { "hunger": 100, "happiness": 40 },
      "description": "A premium bento box. Fully restores hunger and greatly boosts happiness.",
      "category": "food"
    },
    {
      "itemType": "SOAP",
      "price": 15,
      "effects": { "hygiene": 50, "happiness": 5 },
      "description": "Gentle soap for a fresh bath. Restores hygiene.",
      "category": "hygiene"
    },
    {
      "itemType": "SPONGE",
      "price": 5,
      "effects": { "hygiene": 20, "happiness": 2 },
      "description": "A basic sponge. A quick, cheap scrub.",
      "category": "hygiene"
    },
    {
      "itemType": "BUBBLE_BATH",
      "price": 40,
      "effects": { "hygiene": 100, "happiness": 15 },
      "description": "A luxurious bubble bath. Full hygiene restore and a mood boost.",
      "category": "hygiene"
    },
    {
      "itemType": "CANDY",
      "price": 5,
      "effects": { "happiness": 15 },
      "description": "A sweet treat. Gives a small happiness boost.",
      "category": "happiness"
    },
    {
      "itemType": "PLUSH_TOY",
      "price": 30,
      "effects": { "happiness": 50 },
      "description": "A cuddly plush toy. Your Odomo loves it!",
      "category": "happiness"
    },
    {
      "itemType": "MEDICINE",
      "price": 40,
      "effects": { "heal": true, "happiness": 15 },
      "description": "Cures sickness and cheers up your Odomo.",
      "category": "care"
    },
    {
      "itemType": "ENERGY_DRINK",
      "price": 15,
      "effects": { "hunger": 15, "happiness": 10, "hygiene": 10 },
      "description": "A fizzy energy drink. Small boost to hunger, happiness, and hygiene.",
      "category": "food"
    },
    {
      "itemType": "SOUL_STONE",
      "price": 200,
      "effects": { "resurrect": true },
      "description": "A mystical stone that can bring back a fallen Odomo.",
      "category": "special"
    }
  ]
  ```

#### `GET /inventory` *(Auth Required)*
Get the current user's inventory details (list of items possessed).
- **Responses:**
  - `200 OK`: Returns user inventory metadata.

#### `POST /inventory/buy` *(Auth Required)*
Buy an item from the shop using the user's Kobans.
- **Request Body (`BuyItemDto`):**
  ```json
  {
    "itemType": "ONIGIRI", 
    "quantity": 1          
  }
  ```
  - `itemType`: Required enum. Represents the type of item to purchase.
  - `quantity`: Required integer, minimum 1.
- **Responses:**
  - `201 Created`: Item bought successfully.
  - `400 Bad Request`: Insufficient funds to perform the transaction, or validation error.
  - `401 Unauthorized`: Unauthorized access.

#### `POST /inventory/use` *(Auth Required)*
Use an item from the user's inventory.
- **Request Body (`UseItemDto`):**
  ```json
  {
    "itemType": "ONIGIRI" 
  }
  ```
  - `itemType`: Required enum. Represents the type of item to consume/use.
- **Responses:**
  - `201 Created`: Item used successfully.
  - `400 Bad Request`: Validation error.
  - `404 Not Found`: Item not found in the player's inventory or insufficient quantity.

---

### 👾 Odomo
Manage the lifecycle and interactions of the user's virtual companion (Odomo).

#### `POST /odomo` *(Auth Required)*
Create a new Odomo (Birth) for the current user.
- **Request Body (`CreateOdomoDto`):**
  ```json
  {
    "name": "My Odomo" 
  }
  ```
  - `name`: Optional string name for the new Odomo.
- **Responses:**
  - `201 Created`: Odomo created successfully.
  - `409 Conflict`: The current user already possesses an active Odomo.

#### `GET /odomo` *(Auth Required)*
Get the current user's Odomo live stats. These stats are calculated in real-time.
- **Responses:**
  - `200 OK`: Returns the `OdomoStatsDto`.
  - `404 Not Found`: Odomo not found (the user does not have an active Odomo).

#### `POST /odomo/interact` *(Auth Required)*
Interact with the Odomo to affect its stats. Valid interactions include Feeding, Cleaning, and Healing.
- **Request Body (`InteractDto`):**
  ```json
  {
    "type": "FEED", 
    "amount": 30    
  }
  ```
  - `type`: Required enum. Must be one of `"FEED"`, `"CLEAN"`, `"HEAL"`.
  - `amount`: Optional number. How much interaction value to apply (1-100). Defaults to 30.
- **Responses:**
  - `200 OK`: Interaction was successful. Returns the updated `OdomoStatsDto`.
  - `400 Bad Request`: Invalid interaction type or the Odomo is currently dead and cannot be interacted with.

#### `POST /odomo/xp` *(Auth Required)*
**(Dev Tool):** Manually add Experience Points (XP) to the current user's Odomo.
- **Request Body:**
  ```json
  {
    "amount": 1500 
  }
  ```
  - `amount`: Required number of XP to add.
- **Responses:**
  - `200 OK`: XP added successfully. Returns the updated `OdomoStatsDto`.

#### `POST /odomo/kobans` *(Auth Required)*
**(Dev Tool):** Manually add Kobans to the current user's balance.
- **Request Body:**
  ```json
  {
    "amount": 500 
  }
  ```
  - `amount`: Required number of Kobans to add.
- **Responses:**
  - `200 OK`: Kobans added successfully. Returns `{ "success": true, "newBalance": 500 }`.

#### `POST /odomo/stats/set` *(Auth Required)*
**(Dev Tool):** Explicitly set the Odomo's `hunger`, `happiness`, and/or `hygiene` to specific values. Setting any stat > 0 will revive a dead Odomo.
- **Request Body:**
  ```json
  {
    "hunger": 100,
    "happiness": 50,
    "hygiene": 0
  }
  ```
  - `hunger`: Optional number (0-100).
  - `happiness`: Optional number (0-100).
  - `hygiene`: Optional number (0-100).
- **Responses:**
  - `200 OK`: Stats updated successfully. Returns the freshly calculated `OdomoStatsDto`.
  - `404 Not Found`: Odomo not found.

#### `POST /odomo/reset` *(Auth Required)*
**(Dev Tool):** Reset the current user's account to its initial state. The Odomo is kept but reverted to birth state (level 1, 0 XP, TAMAGO stage, all stats at 100, ALIVE). The user's Koban balance is reset to 0 and all inventory items are deleted.
- **Responses:**
  - `200 OK`: Account reset successfully. Returns the fresh `OdomoStatsDto`.
  - `404 Not Found`: Odomo not found.

#### `DELETE /odomo` *(Auth Required)*
Delete (remove/reset) the current user's Odomo.
- **Responses:**
  - `200 OK`: The Odomo was successfully removed. Returns `{ "message": "Odomo deleted successfully" }`.

---

### 🔄 Sync
Endpoints related to synchronizing external/real-world data (such as steps) to progress the game state.

#### `POST /sync/steps` *(Auth Required)*
Synchronize device pedometer steps to gain XP for your Odomo and Kobans for your account.
- **Request Body (`SyncStepsDto`):**
  ```json
  {
    "steps": 5000 
  }
  ```
  - `steps`: Required integer. Cannot be negative. Represents the amount of steps taken.
- **Anti-Cheat Rules:**
  - **Hard cap**: Maximum `50,000` steps per single sync call.
  - **Plausibility check**: The number of steps is validated against the elapsed time since the last sync. A maximum of `180 steps/minute` (~3 steps/second, equivalent to running pace) is allowed. For example, if 10 minutes have passed since the last sync, at most `1,800` steps can be synced.
- **Responses:**
  - `201 Created`: Steps synced successfully. The response contains the amount of XP/Kobans gained and the new Odomo stats. Returns `SyncResponseDto`.
  - `400 Bad Request`: Invalid steps payload (e.g. negative number, exceeds 50,000 cap, exceeds plausible steps for elapsed time) or the Odomo is dead and cannot receive XP.
  - `404 Not Found`: User does not currently own an Odomo.
