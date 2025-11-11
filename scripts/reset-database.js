const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSqlFile(fileName) {
  const sqlPath = path.join(__dirname, fileName)
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`SQL file not found: ${sqlPath}`)
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')

  const statements = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let inDollarQuote = false

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i]
    const nextTwo = sql.slice(i, i + 2)

    if (!inDollarQuote && nextTwo === '$$') {
      inDollarQuote = true
      current += nextTwo
      i += 1
      continue
    }

    if (inDollarQuote && nextTwo === '$$') {
      inDollarQuote = false
      current += nextTwo
      i += 1
      continue
    }

    if (!inDollarQuote) {
      if (!inSingleQuote && !inDoubleQuote && (char === '\'' || char === '"')) {
        if (char === '\'') inSingleQuote = true
        if (char === '"') inDoubleQuote = true
        current += char
        continue
      }

      if (inSingleQuote && char === '\'' && sql[i - 1] !== '\\') {
        inSingleQuote = false
        current += char
        continue
      }

      if (inDoubleQuote && char === '"' && sql[i - 1] !== '\\') {
        inDoubleQuote = false
        current += char
        continue
      }

      if (!inSingleQuote && !inDoubleQuote && char === ';') {
        if (current.trim()) {
          statements.push(current.trim())
        }
        current = ''
        continue
      }
    }

    current += char
  }

  if (current.trim()) {
    statements.push(current.trim())
  }

  for (let i = 0; i < statements.length; i += 1) {
    const statement = statements[i]
    const normalized = statement.toLowerCase()
    if (normalized === 'begin' || normalized === 'commit' || normalized.startsWith('begin ') || normalized.startsWith('commit ')) {
      console.log(`⏭️  Skipping transaction control statement in ${fileName}: ${statement}`)
      continue
    }

    console.log(`📝 Executing ${fileName} statement ${i + 1}/${statements.length}...`)

    const { error } = await supabase.rpc('exec_sql', { sql: statement })
    if (error) {
      console.error(`⚠️  Failed to execute statement ${i + 1}:`, error.message)
      console.error('Statement:')
      console.error(statement)
      throw error
    }
  }
}

async function deleteAllAuthUsers() {
  console.log('🧹 Deleting all auth users...')

  let page = 1
  const perPage = 100

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw new Error(`Failed to list users: ${error.message}`)
    }

    const users = data?.users ?? []
    if (!users.length) {
      break
    }

    for (const user of users) {
      console.log(`   • Deleting user ${user.id} (${user.email ?? 'no email'})`)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
      if (deleteError) {
        throw new Error(`Failed to delete user ${user.id}: ${deleteError.message}`)
      }
    }

    page += 1
  }

  console.log('✅ All auth users deleted.')
}

async function resetDatabase() {
  try {
    console.log('🚨 Resetting Supabase database schema and auth users...')

    await deleteAllAuthUsers()

    console.log('🗑️  Dropping existing tables, policies, and triggers...')
    await executeSqlFile('reset-database.sql')

    console.log('🏗️  Recreating tables, policies, and triggers...')
    const setupFile = fs.existsSync(path.join(__dirname, 'setup-database-fixed.sql'))
      ? 'setup-database-fixed.sql'
      : 'setup-database.sql'
    await executeSqlFile(setupFile)

    console.log('✅ Reset complete!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('- Restart your local development server (so env variables and schema refresh).')
    console.log('- Remove any cached user info in the browser (localStorage, cookies).')
    console.log('- Sign up with a fresh account to verify the end-to-end flow.')
  } catch (error) {
    console.error('❌ Reset failed:', error.message)
    console.log('')
    console.log('If the failure persists, run the SQL manually via Supabase SQL Editor.')
    process.exit(1)
  }
}

resetDatabase()


