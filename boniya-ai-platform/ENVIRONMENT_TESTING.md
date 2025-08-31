# 🧪 Environment Variables Testing Guide

## 📋 **Overview**

This guide provides comprehensive testing tools to verify that all environment variables are properly configured for the Boniya AI platform.

## 🔧 **Testing Methods**

### **Method 1: Local Script Testing**

Run the local test script to verify environment variables:

```bash
# Navigate to project directory
cd boniya-ai-platform

# Run environment test script
npm run test:env

# Or run directly
node scripts/test-env.js
```

**Expected Output:**
```
🧪 BONIYA AI PLATFORM - ENVIRONMENT VARIABLES TEST
============================================================

📂 Database:
  ✅ POSTGRES_URL
    ✓ Valid (123 characters)
  ✅ PRISMA_DATABASE_URL
    ✓ Valid (456 characters)
  ✅ POSTGRES_PRISMA_URL
    ✓ Valid (145 characters)

📂 API Keys:
  ✅ GEMINI_API_KEY
    ✓ Valid (39 characters)
  ✅ BAIDU_OCR_API_KEY
    ✓ Valid (24 characters)
  ✅ BAIDU_OCR_SECRET_KEY
    ✓ Valid (32 characters)

📂 Authentication:
  ✅ NEXTAUTH_SECRET
    ✓ Valid (64 characters)
  ✅ NEXTAUTH_URL
    ✓ Valid (30 characters)

📊 SUMMARY:
Total Tests: 8
Passed: 8
Failed: 0
Success Rate: 100%

🎉 All environment variables are properly configured!
```

### **Method 2: API Endpoint Testing**

Test via HTTP API endpoints:

```bash
# Start development server
npm run dev

# Test all environment variables
curl http://localhost:3000/api/test-env

# Test specific variable
curl -X POST http://localhost:3000/api/test-env \
  -H "Content-Type: application/json" \
  -d '{"variable_name": "GEMINI_API_KEY"}'
```

### **Method 3: Production Testing**

After deployment to Vercel:

```bash
# Test production environment
curl https://your-app.vercel.app/api/test-env
```

## 📊 **Test Results Interpretation**

### **Status Indicators**

- ✅ **Green**: Variable is configured and valid
- ❌ **Red**: Variable is missing or invalid
- ⚠️ **Yellow**: Variable needs attention

### **Success Rates**

- **100%**: All variables configured correctly
- **90-99%**: Most variables OK, minor issues
- **70-89%**: Some critical variables missing
- **<70%**: Major configuration issues

## 🔍 **Individual Variable Tests**

### **Database Variables**

| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `POSTGRES_URL` | Yes | `postgres://user:pass@host:port/db` | Direct database connection |
| `PRISMA_DATABASE_URL` | Yes | `prisma+postgres://accelerate.prisma-data.net/?api_key=...` | Prisma Accelerate connection |
| `POSTGRES_PRISMA_URL` | Optional | `postgres://...?pgbouncer=true` | Pooled connection |

### **API Keys**

| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `GEMINI_API_KEY` | Yes | `AIza...` (30+ chars) | Google Gemini AI API key |
| `BAIDU_OCR_API_KEY` | Yes | 24 characters | Baidu OCR API key |
| `BAIDU_OCR_SECRET_KEY` | Yes | 32 characters | Baidu OCR secret key |

### **Authentication**

| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `NEXTAUTH_SECRET` | Yes | 32+ characters | NextAuth.js secret key |
| `NEXTAUTH_URL` | Yes | Valid URL | Application base URL |

## 🚨 **Common Issues and Solutions**

### **Database Connection Issues**

**Problem**: `POSTGRES_URL` connection fails
```
❌ POSTGRES_URL
  ⚠️ Connection failed: timeout
```

**Solutions**:
1. Check database server status
2. Verify connection string format
3. Ensure network connectivity
4. Check firewall settings

### **API Key Format Issues**

**Problem**: Invalid API key format
```
❌ GEMINI_API_KEY
  ⚠️ Should start with "AIza"
```

**Solutions**:
1. Verify API key from provider console
2. Check for extra spaces or quotes
3. Ensure complete key is copied

### **Missing Environment Variables**

**Problem**: Variable not configured
```
❌ NEXTAUTH_SECRET
  ⚠️ Not configured
```

**Solutions**:
1. Add variable to `.env.local`
2. Set variable in Vercel dashboard
3. Restart development server

## 🔄 **Continuous Testing**

### **Pre-deployment Checklist**

1. ✅ Run local environment test
2. ✅ Verify 100% success rate
3. ✅ Test database connectivity
4. ✅ Validate API key access
5. ✅ Configure Vercel environment variables

### **Post-deployment Verification**

1. ✅ Test production API endpoint
2. ✅ Verify all services accessible
3. ✅ Check application logs
4. ✅ Test core functionality

## 📝 **Environment Variables Checklist**

Copy this checklist to Vercel dashboard:

```env
# Database Configuration
POSTGRES_URL=postgres://...
PRISMA_DATABASE_URL=prisma+postgres://...
POSTGRES_PRISMA_URL=postgres://...

# API Keys
GEMINI_API_KEY=AIza...
BAIDU_OCR_API_KEY=...
BAIDU_OCR_SECRET_KEY=...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app
```

## 🛠️ **Troubleshooting Commands**

```bash
# Check environment file exists
ls -la .env.local

# View environment variables (be careful with sensitive data)
cat .env.local | grep -v "SECRET\|KEY"

# Test specific service
curl -X GET http://localhost:3000/api/test-env

# Check application logs
npm run dev 2>&1 | grep -i error

# Verify Vercel deployment
vercel env ls
```

## 📞 **Support**

If tests continue to fail:

1. **Check Documentation**: Review environment setup guides
2. **Verify Credentials**: Confirm all API keys are valid
3. **Test Connectivity**: Ensure network access to services
4. **Review Logs**: Check application and deployment logs
5. **Contact Support**: Provide test results and error messages

---

**Remember**: Never commit real environment variables to version control. Always use `.env.local` for local development and Vercel dashboard for production.
