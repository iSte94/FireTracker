-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "monthly_expenses" DECIMAL,
    "annual_expenses" DECIMAL,
    "current_age" INTEGER,
    "retirement_age" INTEGER,
    "swr_rate" DECIMAL,
    "expected_return" DECIMAL,
    "inflation_rate" DECIMAL,
    CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "net_worth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "net_worth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target_amount" DECIMAL NOT NULL,
    "current_amount" DECIMAL NOT NULL,
    "target_date" DATETIME,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investment_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal_type" TEXT NOT NULL,
    "target_value" DECIMAL NOT NULL,
    "current_value" DECIMAL NOT NULL DEFAULT 0,
    "target_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "investment_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolio_allocations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goal_id" TEXT NOT NULL,
    "asset_class" TEXT NOT NULL,
    "target_percentage" DECIMAL NOT NULL,
    "current_percentage" DECIMAL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "portfolio_allocations_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "investment_goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "ticker_symbol" TEXT,
    "quantity" DECIMAL,
    "price_per_unit" DECIMAL,
    "total_amount" DECIMAL NOT NULL,
    "transaction_date" DATETIME NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "fees" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "financial_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolio_holdings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "ticker_symbol" TEXT,
    "total_quantity" DECIMAL NOT NULL,
    "average_cost" DECIMAL NOT NULL,
    "total_cost" DECIMAL NOT NULL,
    "current_price" DECIMAL,
    "current_value" DECIMAL,
    "unrealized_gain_loss" DECIMAL,
    "percentage_of_portfolio" DECIMAL,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portfolio_holdings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "period" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "is_recurring" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "alert_threshold" DECIMAL DEFAULT 80,
    "shared_with" TEXT NOT NULL DEFAULT '[]',
    "goal_id" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budgets_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budget_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "budget_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "percentage_used" DECIMAL,
    "message" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "budget_alerts_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budget_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "net_worth_user_id_idx" ON "net_worth"("user_id");

-- CreateIndex
CREATE INDEX "expenses_user_id_idx" ON "expenses"("user_id");

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "investment_goals_user_id_idx" ON "investment_goals"("user_id");

-- CreateIndex
CREATE INDEX "investment_goals_status_idx" ON "investment_goals"("status");

-- CreateIndex
CREATE INDEX "investment_goals_goal_type_idx" ON "investment_goals"("goal_type");

-- CreateIndex
CREATE INDEX "portfolio_allocations_goal_id_idx" ON "portfolio_allocations"("goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_allocations_goal_id_asset_class_key" ON "portfolio_allocations"("goal_id", "asset_class");

-- CreateIndex
CREATE INDEX "financial_transactions_user_id_idx" ON "financial_transactions"("user_id");

-- CreateIndex
CREATE INDEX "financial_transactions_transaction_date_idx" ON "financial_transactions"("transaction_date" DESC);

-- CreateIndex
CREATE INDEX "financial_transactions_asset_type_ticker_symbol_idx" ON "financial_transactions"("asset_type", "ticker_symbol");

-- CreateIndex
CREATE INDEX "financial_transactions_transaction_type_idx" ON "financial_transactions"("transaction_type");

-- CreateIndex
CREATE INDEX "portfolio_holdings_user_id_idx" ON "portfolio_holdings"("user_id");

-- CreateIndex
CREATE INDEX "portfolio_holdings_asset_type_ticker_symbol_idx" ON "portfolio_holdings"("asset_type", "ticker_symbol");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_holdings_user_id_asset_type_asset_name_ticker_symbol_key" ON "portfolio_holdings"("user_id", "asset_type", "asset_name", "ticker_symbol");

-- CreateIndex
CREATE INDEX "budgets_user_id_idx" ON "budgets"("user_id");

-- CreateIndex
CREATE INDEX "budgets_category_idx" ON "budgets"("category");

-- CreateIndex
CREATE INDEX "budgets_period_idx" ON "budgets"("period");

-- CreateIndex
CREATE INDEX "budgets_status_idx" ON "budgets"("status");

-- CreateIndex
CREATE INDEX "budget_alerts_user_id_idx" ON "budget_alerts"("user_id");

-- CreateIndex
CREATE INDEX "budget_alerts_budget_id_idx" ON "budget_alerts"("budget_id");
