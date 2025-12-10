When people talk about “best practices for putting code in production,” they usually mix deployment steps, DevOps processes, testing, CI/CD, infra choices, and a bunch of opinions.
Let’s cut all noise and focus on **what truly matters**, especially for someone like you who builds full systems end-to-end.

Below is the _actual, real-world, senior-level_ production pipeline followed by good engineering teams.

---

# **THE GOLD STANDARD FOR PRODUCTION DEPLOYMENT**

## **1. Clean, Stable, Reviewed Codebase**

Before you even think of servers:

### ✓ Use a clean branching model

- `main` → Always production-ready
- `dev` → Staging/testing
- Feature branches → small, focused, merged via PR

### ✓ Mandatory Pull Requests

Every production change must go through:

- Linting
- Automated tests
- Review (even if self-review + test suite)

---

# **2. Proper Environment Configuration**

Never hardcode anything.

### Use:

- `.env` file for local
- `.env.staging`, `.env.prod` for servers
- Store secrets in:

  - AWS Parameter Store
  - HashiCorp Vault
  - GitHub Actions Secret Store

**Rules**

- `.env` is never pushed to Git
- Only environment variables control behavior
- Feature flags for sensitive toggles

---

# **3. Automated Testing**

At minimum, you need:

### **Unit Tests**

For utilities, services, helpers.

### **Integration Tests**

For controllers, APIs, DB queries.

### **E2E Tests (Optional but ideal)**

Using tools like:

- Playwright
- Cypress

**Goal:** You deploy only when your tests pass.

---

# **4. Build → Test → Release Pipeline (CI/CD)**

This is the heart of modern deployments.

### A perfect CI/CD workflow:

1. Push code to GitHub
2. GitHub Actions:

   - Installs dependencies
   - Runs linting
   - Runs unit tests
   - Runs integration tests
   - Builds docker image

3. Push docker image to registry (GHCR / DockerHub / ECR)
4. CD (ArgoCD / GitHub Actions / Ansible / CapRover):

   - Pulls the latest image
   - Runs migration scripts
   - Restarts server with zero downtime

### Key point:

**You never manually copy files to production.**
Everything goes through CI/CD.

---

# **5. Use Docker Everywhere**

This is where most developers level-up.

### Your app should be:

- Containerized
- Immutable
- Portable
- Versioned

A correct Docker approach gives:

- Same local dev environment
- Same staging
- Same production
- Zero “works on my machine” issues

Use **docker-compose for dev** and **docker run / docker swarm / kubernetes** for production.

---

# **6. Use a Reverse Proxy**

For Node.js, the standard setup is:

```
Browser → Nginx → Node.js App → Database
```

Reasons:

- SSL termination
- Caching
- Access logs
- Rate limiting
- Auto-redirects (HTTP -> HTTPS)
- Load balancing (production scaling)

---

# **7. Zero-Downtime Deployments**

Best practice is to avoid downtime entirely.

Options:

### If using PM2:

- `pm2 reload app`
- Rolling restart

### If using Docker:

- Blue-green deployments
- Rolling deployments
- Kubernetes rollout updates

---

# **8. Logging, Monitoring, Alerting**

This is the biggest difference between junior and senior-level production setups.

### Logging Tools

- Winston
- Bunyan
- pino

### Real-time log pipelines

- Elastic Stack (ELK)
- Loki + Promtail + Grafana

### Monitoring

- Prometheus
- Grafana dashboards

### Alerts

- Slack alerts
- PagerDuty
- Email monitoring

You should know:

- Error rate
- API latency
- CPU/RAM usage
- DB slow queries

---

# **9. Backups & Disaster Recovery**

**Non-negotiable:**

- Nightly DB backups
- Offsite storage (S3)
- Automated restore testing

---

# **10. Security Best Practices**

This is the part everyone ignores.

### Backend

- Validate ALL inputs
- Sanitize outputs
- Use rate limitation
- RBAC for admin access
- Helmet middleware for Node.js
- CSRF protection (if needed)

### Server

- Fail2ban
- Firewall rules
- Allow only SSH key login
- Disable password SSH
- No root SSH login
- Auto OS patching

### Database

- Use least privilege
- Never expose DB port publicly
- Use strong passwords
- Rotate credentials

---

# **11. Blue–Green or Staging Environment**

Have a staging environment identical to production so you can:

- Test real data
- Test real APIs
- Let QA validate

Never push directly from local → production.

---

# **12. Rollbacks**

Every release must be revertible in 1 command.

### With Docker:

```
docker service rollback app
```

### With PM2:

```
pm2 deploy production revert 1
```

### With GitHub Actions:

Re-run last successful deployment.

---

# **13. Documentation**

At minimum:

- How to run locally
- How to deploy
- Env variable list
- DB schema update process

---

# **PUTTING IT ALL TOGETHER**

A true production pipeline looks like this:

### Local dev

→ Feature branch
→ Write code
→ Push to GitHub

### CI

→ Lint
→ Test
→ Audit dependencies
→ Build docker

### CD

→ Push image
→ Pull image
→ Apply migrations
→ Restart app with zero downtime
→ Run post-deployment tests
→ Notify team

### Monitoring

→ Logs
→ Alerts
→ Performance dashboard

### Backups

→ Daily snapshot

That’s the industry standard followed by solid engineering teams.

---
