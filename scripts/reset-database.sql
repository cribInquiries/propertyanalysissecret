-- Reset database schema for LuxeAnalytics Supabase project
-- --------------------------------------------------------
-- ⚠️  WARNING: This script permanently deletes all data in the custom tables
--     used by the application. Run it only if you want to wipe the environment.
-- --------------------------------------------------------

-- Clean storage uploads (optional – comment out if you want to keep uploaded files)
delete from storage.objects where bucket_id = 'user-uploads';
delete from storage.buckets where id = 'user-uploads';

-- Drop triggers
drop trigger if exists update_property_hero_updated_at on public.property_hero;
drop trigger if exists update_revenue_projections_updated_at on public.revenue_projections;
drop trigger if exists update_maintenance_breakdown_updated_at on public.maintenance_breakdown;
drop trigger if exists update_purchase_motivation_updated_at on public.purchase_motivation;
drop trigger if exists update_setup_costs_updated_at on public.setup_costs;
drop trigger if exists update_value_maximization_updated_at on public.value_maximization;
drop trigger if exists update_company_portfolio_updated_at on public.company_portfolio;
drop trigger if exists update_saved_properties_updated_at on public.saved_properties;
drop trigger if exists update_property_analyses_updated_at on public.property_analyses;
drop trigger if exists update_user_data_updated_at on public.user_data;
drop trigger if exists update_user_profiles_updated_at on public.user_profiles;

-- Drop helper functions
drop function if exists public.update_property_hero_updated_at() cascade;
drop function if exists public.update_revenue_projections_updated_at() cascade;
drop function if exists public.update_maintenance_breakdown_updated_at() cascade;
drop function if exists public.update_purchase_motivation_updated_at() cascade;
drop function if exists public.update_setup_costs_updated_at() cascade;
drop function if exists public.update_value_maximization_updated_at() cascade;
drop function if exists public.update_company_portfolio_updated_at() cascade;
drop function if exists public.update_saved_properties_updated_at() cascade;
drop function if exists public.update_property_analyses_updated_at() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_updated_at_column() cascade;

-- Drop policies explicitly to avoid dependency warnings
drop policy if exists "Users can view own images" on public.image_metadata;
drop policy if exists "Users can insert own images" on public.image_metadata;
drop policy if exists "Users can update own images" on public.image_metadata;
drop policy if exists "Users can delete own images" on public.image_metadata;

drop policy if exists "Users can view own analyses" on public.property_analyses;
drop policy if exists "Users can insert own analyses" on public.property_analyses;
drop policy if exists "Users can update own analyses" on public.property_analyses;
drop policy if exists "Users can delete own analyses" on public.property_analyses;

drop policy if exists "Users can view own data" on public.user_data;
drop policy if exists "Users can insert own data" on public.user_data;
drop policy if exists "Users can update own data" on public.user_data;
drop policy if exists "Users can delete own data" on public.user_data;

drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;

drop policy if exists "Users can delete their own property hero data" on public.property_hero;
drop policy if exists "Users can insert their own property hero data" on public.property_hero;
drop policy if exists "Users can update their own property hero data" on public.property_hero;
drop policy if exists "Users can view their own property hero data" on public.property_hero;

drop policy if exists "Users can delete their own purchase motivation" on public.purchase_motivation;
drop policy if exists "Users can insert their own purchase motivation" on public.purchase_motivation;
drop policy if exists "Users can update their own purchase motivation" on public.purchase_motivation;
drop policy if exists "Users can view their own purchase motivation" on public.purchase_motivation;

drop policy if exists "Users can delete their own revenue projections" on public.revenue_projections;
drop policy if exists "Users can insert their own revenue projections" on public.revenue_projections;
drop policy if exists "Users can update their own revenue projections" on public.revenue_projections;
drop policy if exists "Users can view their own revenue projections" on public.revenue_projections;

drop policy if exists "Users can delete their own setup costs" on public.setup_costs;
drop policy if exists "Users can insert their own setup costs" on public.setup_costs;
drop policy if exists "Users can update their own setup costs" on public.setup_costs;
drop policy if exists "Users can view their own setup costs" on public.setup_costs;

drop policy if exists "Users can delete their own maintenance breakdown" on public.maintenance_breakdown;
drop policy if exists "Users can insert their own maintenance breakdown" on public.maintenance_breakdown;
drop policy if exists "Users can update their own maintenance breakdown" on public.maintenance_breakdown;
drop policy if exists "Users can view their own maintenance breakdown" on public.maintenance_breakdown;

drop policy if exists "Users can delete their own value maximization" on public.value_maximization;
drop policy if exists "Users can insert their own value maximization" on public.value_maximization;
drop policy if exists "Users can update their own value maximization" on public.value_maximization;
drop policy if exists "Users can view their own value maximization" on public.value_maximization;

drop policy if exists "Users can delete their own company portfolio" on public.company_portfolio;
drop policy if exists "Users can insert their own company portfolio" on public.company_portfolio;
drop policy if exists "Users can update their own company portfolio" on public.company_portfolio;
drop policy if exists "Users can view their own company portfolio" on public.company_portfolio;

drop policy if exists "Users can delete their own saved properties" on public.saved_properties;
drop policy if exists "Users can insert their own saved properties" on public.saved_properties;
drop policy if exists "Users can update their own saved properties" on public.saved_properties;
drop policy if exists "Users can view their own saved properties" on public.saved_properties;

drop policy if exists "user_settings_delete_own" on public.user_settings;
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;
drop policy if exists "user_settings_select_own" on public.user_settings;

drop policy if exists "Users can insert their own activity log" on public.user_activity_log;
drop policy if exists "Users can view their own activity log" on public.user_activity_log;
drop policy if exists "user_activity_log_insert_own" on public.user_activity_log;
drop policy if exists "user_activity_log_select_own" on public.user_activity_log;

drop policy if exists "Users can insert their own data changes" on public.data_changes;
drop policy if exists "Users can view their own data changes" on public.data_changes;

-- Drop tables (CASCADE removes dependent objects such as indexes)
drop table if exists public.image_metadata cascade;
drop table if exists public.property_hero cascade;
drop table if exists public.revenue_projections cascade;
drop table if exists public.maintenance_breakdown cascade;
drop table if exists public.purchase_motivation cascade;
drop table if exists public.setup_costs cascade;
drop table if exists public.value_maximization cascade;
drop table if exists public.company_portfolio cascade;
drop table if exists public.saved_properties cascade;
drop table if exists public.user_settings cascade;
drop table if exists public.user_activity_log cascade;
drop table if exists public.data_changes cascade;
drop table if exists public.security_events cascade;
drop table if exists public.property_analyses cascade;
drop table if exists public.user_data cascade;
drop table if exists public.user_profiles cascade;

-- After running this script, execute scripts/setup-database.sql (or setup-database-fixed.sql)
-- to recreate the schema, then re-run the provisioning steps in docs/supabase-setup.md.

