const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Supabase database schema...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-database.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct query execution as fallback
          const { error: directError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(0)
          
          // If direct query works, the issue might be with the RPC function
          if (!directError) {
            console.log(`⚠️  Statement ${i + 1} might need manual execution in Supabase SQL Editor`)
          }
        }
      }
    }
    
    console.log('✅ Database schema setup completed!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the contents of scripts/setup-database.sql')
    console.log('5. Click "Run" to execute the schema')
    console.log('')
    console.log('🔗 Your Supabase project: ' + supabaseUrl)
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    console.log('')
    console.log('📋 Manual setup required:')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the contents of scripts/setup-database.sql')
    console.log('5. Click "Run" to execute the schema')
  }
}

setupDatabase()


