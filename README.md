# Job Board - TailAdmin Next.js

A comprehensive job board application with employer-recruiter assignment system.

## 🎉 Latest Updates

### Job Assignment System
- ✅ Employers can hire recruiters for specific jobs
- ✅ Real-time assignment status tracking
- ✅ Unified dashboard for both employers and recruiters
- ✅ Extended session management (30-day sessions)
- ✅ Comprehensive debugging and testing tools

### New Features
- **Employer Dashboard**: View and manage all job assignments
- **Assignment Status Tracking**: Real-time updates on assignment progress
- **Enhanced Authentication**: Longer session duration, better UX
- **Debug Tools**: Comprehensive debugging interface at `/debug`
- **Data Migration**: Seamless migration of existing job assignments

## Update Logs

### Version 0.1.8 - [Jan 28, 2025]

#### New Features
- **Feature 01:** Enhanced job assignment status tracking system
- **Feature 02:** Data migration tool for existing job assignments  
- **Feature 03:** Extended authentication sessions (30-day duration)
- **Feature 04:** Comprehensive debugging interface at `/debug`
- **Feature 05:** Assignment testing page at `/test-assignments`

#### Improvements
- **Enhancement 01:** Unified job_recruiters and job_assignments workflow
- **Enhancement 02:** Better error handling for database constraints
- **Enhancement 03:** Improved session management and user experience
- **Enhancement 04:** Added image domain configuration for recruiter avatars

#### Bug Fixes
- **Fix 01:** Resolved session timeout issues causing frequent logouts
- **Fix 02:** Fixed database constraint errors in assignment creation
- **Fix 03:** Corrected image loading for external avatar sources

### Version 0.1.7 - [Previous Release]
- Previous features...

## Installation and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/job-board-tailadmin.git

# Navigate into the directory
cd job-board-tailadmin

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

1. **Create an Account**:
   - Visit the [registration page](/register) to create a new account.
   - Choose your role: Employer or Recruiter.

2. **Post a Job** (Employers):
   - After logging in, navigate to the "Post a Job" section.
   - Fill in the job details and submit.

3. **Apply for a Job** (Recruiters):
   - Browse available jobs on your dashboard.
   - Submit your application for the desired job.

4. **Manage Assignments**:
   - Employers can manage job assignments from their dashboard.
   - Recruiters can track their application status in real-time.

## Testing

To ensure the application is working as expected, we have provided a testing page.

- Visit `/test-assignments` to access the assignment testing interface.
- Ensure all fields are functional and real-time updates are working.

## Debugging

For developers and advanced users, a debugging interface is available.

- Visit `/debug` to access the debugging tools.
- Use this interface to inspect issues, monitor server responses, and track errors.

## Contributions

We welcome contributions from the community. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push to your fork.
4. Submit a pull request detailing your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Add all your changes
git add .

# Commit with version update
git commit -m "feat: enhanced job assignment system v0.1.8

- Add unified assignment status tracking
- Implement data migration for existing assignments  
- Extend session duration to 30 days
- Add comprehensive debugging tools
- Fix image domain configuration
- Improve assignment workflow and error handling"

# Update package.json version
git add package.json
git commit -m "chore: bump version to 0.1.8"

# Create the v0.1.8 tag
git tag -a v0.1.8 -m "Enhanced job assignment system with status tracking and debugging tools"

# Push everything
git push origin main
git push origin v0.1.8
