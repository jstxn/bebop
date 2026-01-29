# Migration Guide

How to migrate your team from manual AI workflows to Bebop.

## Overview

This guide helps teams transition from ad-hoc AI usage to structured, optimized workflows with Bebop.

**Target Audience:** Development teams using AI coding assistants (Cursor, Copilot, Claude, etc.)

**Prerequisites:**
- Team uses AI coding assistants
- Has existing coding standards/documentation
- Node.js 18+ installed

**Estimated Time:** 2-4 weeks for full migration

---

## Phase 1: Assessment & Planning (Week 1)

### 1.1 Audit Current AI Usage

**Survey the team:**
```markdown
1. How do you currently use AI coding assistants?
   - [ ] Daily
   - [ ] Weekly
   - [ ] Occasionally

2. What tasks do you use AI for?
   - [ ] Writing new features
   - [ ] Refactoring
   - [ ] Bug fixes
   - [ ] Writing tests
   - [ ] Documentation
   - [ ] Other: __________

3. What prompts do you repeat often?
   - _________________________________________________
   - _________________________________________________
   - _________________________________________________

4. What's your biggest frustration with AI assistants?
   - [ ] Cost
   - [ ] Context loss
   - [ ] Inconsistent results
   - [ ] Long prompts
   - [ ] Other: __________
```

**Analyze the data:**
```bash
# Create a spreadsheet
cat > ai-usage-survey.csv << 'EOF'
Team Member,Daily Usage,Repetitive Tasks,Frustrations
Alice,Writing tests,refactoring,cost
Bob,bug fixes,documentation,context loss
Charlie,features,refactoring,inconsistent results
EOF
```

### 1.2 Inventory Existing Documentation

**Identify sources:**
```bash
# Find common documentation files
find . -name "CLAUDE.md" -o -name "AGENTS.md" -o -name "CONTRIBUTING.md"
find . -name "guidelines.md" -o -name "standards.md"
find . -name "STYLE_GUIDE.md"
```

**Create an inventory:**
```markdown
## Existing Documentation Inventory

| File | Purpose | Lines | Reusable? |
|------|---------|-------|-----------|
| CLAUDE.md | AI assistant guidelines | 674 | Yes → Pack |
| AGENTS.md | Agent workflows | 245 | Yes → Pack |
| STYLE_GUIDE.md | Code style | 120 | Yes → Pack |
| CONTRIBUTING.md | Contribution guidelines | 180 | Partial |
| docs/naming-conventions.md | Naming rules | 50 | Yes → Pack |
```

### 1.3 Identify High-Impact Opportunities

**Prioritize based on:**
- Frequency of use (daily > weekly > monthly)
- Token cost (larger docs > smaller docs)
- Repetition (repeat tasks > unique tasks)

**Example prioritization:**
```markdown
## High-Impact Opportunities

1. **CLAUDE.md** (674 lines)
   - Used daily
   - Sent in every prompt
   - Estimated savings: 90% tokens
   - **Priority: HIGH** → Create pack immediately

2. **Endpoint creation workflow**
   - Repeated 10+ times/week
   - Multi-step process
   - Estimated savings: 80% time
   - **Priority: HIGH** → Create plan

3. **Refactoring guidelines** (120 lines)
   - Used weekly
   - Moderate token cost
   - Estimated savings: 70% tokens
   - **Priority: MEDIUM** → Create pack in Phase 2

4. **One-off tasks**
   - Unique prompts
   - No repetition
   - **Priority: LOW** → Skip for now
```

---

## Phase 2: Pilot with Small Team (Week 2)

### 2.1 Setup for Pilot Team

**Install bebop:**
```bash
# Team-wide installation
npm install -g @bebop/cli

# Initialize bebop
bebop init

# Setup project namespace
cd my-project
bebop init --project
```

**Create initial pack:**
```bash
# Create pack from CLAUDE.md
bebop pack create --name my-company/core@v1

# Edit the pack file
vim ~/.bebop/packs/my-company-core@v1.md
```

**Example pack (from CLAUDE.md):**
```yaml
id: my-company/core
version: 1
rules:
  - id: NO_XSVC_IMPORT
    text: "Services are independent; no runtime imports across services/**."
    applies_when:
      paths: ["services/**"]

  - id: NO_SECRETS
    text: "Never add secrets to code, docs, or commits."
    applies_when:
      any: true

  - id: VALIDATE_IN_DOCKER
    text: "Run validators in Docker for the specific service changed."
    applies_when:
      paths: ["services/**"]

  - id: PREFER_TARGETED_TESTS
    text: "Prefer targeted eslint/tsc on changed files."
    applies_when:
      paths: ["services/**"]
      languages: ["typescript"]
```

### 2.2 Create Pilot Pack

**From your most-used documentation:**

```bash
# Import existing docs
bebop pack import CLAUDE.md

# This creates a source pack
# Review and compile to extract rules
```

**Manual compilation (better quality):**
```markdown
# Review CLAUDE.md line by line
# Extract atomic rules
# Create pack YAML
```

### 2.3 Train Pilot Team

**Onboarding session (1 hour):**

1. **Introduction (15 min)**
   - What is Bebop?
   - Why use it? (92% token savings)
   - How it works

2. **Hands-on (30 min)**
   - Installation
   - Basic commands
   - Using packs
   - Creating simple plans

3. **Q&A (15 min)**

**Training materials:**
```bash
# Create training script
cat > training/basic-usage.sh << 'EOF'
#!/bin/bash
echo "Bebop Training - Basic Usage"
echo ""
echo "1. Install bebop:"
echo "   npm install -g @bebop/cli"
echo ""
echo "2. Initialize:"
echo "   bebop init"
echo ""
echo "3. Use a pack:"
echo "   bebop chat &use my-company/core Create a feature"
echo ""
echo "4. Check compiled prompt:"
echo "   bebop chat --dry-run &use my-company/core Create a feature"
EOF
```

### 2.4 Collect Feedback

**Daily check-ins (15 min):**
- What worked well?
- What was confusing?
- What features do you miss?
- How much time/money did you save?

**Survey after 1 week:**
```markdown
## Pilot Feedback Survey

1. How easy was it to get started?
   - [ ] Very easy
   - [ ] Somewhat easy
   - [ ] Neutral
   - [ ] Somewhat difficult
   - [ ] Very difficult

2. How much time did you save?
   - [ ] > 50%
   - [ ] 25-50%
   - [ ] 10-25%
   - [ ] < 10%
   - [ ] No savings

3. What should we improve?
   - _________________________________________________
```

---

## Phase 3: Scale to Full Team (Week 3-4)

### 3.1 Create Team-Specific Packs

**Based on pilot feedback:**

```bash
# Create packs for different teams
bebop pack create --name my-company/frontend@v1
bebop pack create --name my-company/backend@v1
bebop pack create --name my-company/mobile@v1
```

**Example frontend pack:**
```yaml
id: my-company/frontend
version: 1
rules:
  - id: USE_TYPESCRIPT
    text: "Use TypeScript for all React components. Avoid 'any'."
    applies_when:
      languages: ["typescript", "javascript"]

  - id: USE_FUNCTIONAL_COMPONENTS
    text: "Use functional components with hooks. Avoid class components."
    applies_when:
      languages: ["typescript", "javascript"]
      paths: ["src/components/**"]

  - id: FOLLOW_ACCESSIBILITY_GUIDELINES
    text: "Follow WCAG 2.1 AA accessibility guidelines."
    applies_when:
      any: true

  - id: WRITE_COMPONENT_TESTS
    text: "Write tests for all components using React Testing Library."
    applies_when:
      paths: ["src/components/**"]
```

### 3.2 Create Common Plans

**Identify repetitive workflows:**

```bash
# Create plan for common tasks
bebop plan create --name my-company/create-component
bebop plan create --name my-company/create-api-endpoint
bebop plan create --name my-company/refactor-function
```

**Example plan - create component:**
```yaml
id: my-company/create-component
version: 1
vars:
  component_name: ""
  src_dir: "src/components"

steps:
  - READ: "{src_dir}/README.md"
  - EDIT: "{src_dir}/{component_name}.tsx"
  - EDIT: "{src_dir}/{component_name}.test.tsx"
  - EDIT: "{src_dir}/index.ts"
  - RUN: "npm run lint"
  - RUN: "npm test"
```

### 3.3 Team-Wide Onboarding

**Onboarding checklist:**

```markdown
## Bebop Onboarding Checklist

### Setup
- [ ] Install Node.js 18+
- [ ] Install bebop: `npm install -g @bebop/cli`
- [ ] Initialize: `bebop init`
- [ ] Initialize project: `cd my-project && bebop init --project`

### Training
- [ ] Complete basic training session
- [ ] Read quick start guide
- [ ] Try basic commands
- [ ] Create first pack
- [ ] Create first plan

### Usage
- [ ] Use bebop for daily tasks
- [ ] Track token savings
- [ ] Provide feedback

### Advanced
- [ ] Customize packs
- [ ] Create team-specific plans
- [ ] Set up aliases
- [ ] Configure linting/validation
```

**Team training session (2 hours):**

1. **Review** (30 min)
   - Pilot team results
   - Lessons learned
   - Success stories

2. **Hands-on** (60 min)
   - Installation
   - Using existing packs
   - Creating plans
   - Advanced features

3. **Discussion** (30 min)
   - Team-specific needs
   - Customization plans
   - Q&A

### 3.4 Establish Best Practices

**Document team conventions:**

```markdown
# Team Bebop Guidelines

## Pack Conventions

- All pack IDs use format: `my-company/{team}/{pack}@v{version}`
- Rule IDs use UPPER_CASE with underscores
- Every rule has `applies_when` conditions
- Include enforcement hooks where possible

## Plan Conventions

- All plan IDs use format: `my-company/{team}/{plan}@v{version}`
- Plans have 5-12 steps maximum
- Include validation steps (lint, test)
- Use variable substitution for flexibility

## Usage Conventions

- Always use dry-run for new tasks first
- Use &use with specific packs, not aliases (for clarity)
- Create plans for repeated workflows (use > 3 times)
- Review compiled prompts before sending to LLM

## Collaboration

- Share packs in team repo: `internal/packs/`
- Share plans in team repo: `internal/plans/`
- Review pack changes in PRs
- Test packs before deploying
```

---

## Phase 4: Optimization & Maintenance (Ongoing)

### 4.1 Monitor Usage

**Weekly metrics:**

```bash
# Check stats
bebop stats

# Review output:
📊 Bebop Statistics

Sessions:
  - Total: 23
  - Active: 1
  - This week: 15

Token savings:
  - Total saved: 127,450 tokens
  - Average per session: 5,541 tokens
```

**Track team adoption:**

```bash
# Create adoption tracker
cat > internal/bebop/adoption.csv << 'EOF'
Week,Users,Sessions,Tokens Saved,Cost Saved
1,3,15,5,000,$0.15
2,5,25,12,000,$0.36
3,8,40,20,000,$0.60
EOF
```

### 4.2 Iterate on Packs

**Monthly review:**

```markdown
## Pack Review Template

### Pack: my-company/core@v1

**Usage:**
- Times used: 150
- Teams using: All
- Avg tokens saved: 85%

**Issues:**
- [ ] Rule NO_XSVC_IMPORT too vague
- [ ] Missing validation for nested services

**Action items:**
- [ ] Add enforcement hook for NO_XSVC_IMPORT
- [ ] Clarify rule text
- [ ] Update to v1.1

**Owner:** @team-lead
**Due:** 2025-02-15
```

### 4.3 Optimize Plans

**Quarterly review:**

```markdown
## Plan Review Template

### Plan: my-company/create-api-endpoint@v1

**Usage:**
- Times run: 45
- Success rate: 92%
- Avg completion time: 45 min

**Issues:**
- [ ] Step 3 (validation) often skipped
- [ ] Missing error handling step

**Action items:**
- [ ] Make validation step mandatory
- [ ] Add error handling step
- [ ] Update to v1.1

**Owner:** @backend-lead
**Due:** 2025-02-28
```

### 4.4 Knowledge Sharing

**Monthly sharing sessions (30 min):**

```markdown
## Agenda: Bebop Sharing Session

1. **Success Stories (10 min)**
   - @alice: How I saved 50% time on API endpoints
   - @bob: New pack for security reviews

2. **New Features (10 min)**
   - Natural language constraint extraction
   - Plan templates

3. **Tips & Tricks (10 min)**
   - Using aliases for common workflows
   - Debugging compiled prompts
   - Creating reusable plans

4. **Q&A (10 min)**
```

---

## Common Migration Challenges

### Challenge 1: Resistance to Change

**Symptoms:**
- Team members prefer existing workflow
- "It's too complex"
- "I don't want to learn new tools"

**Solutions:**
1. **Start with pilot team** - Early adopters become advocates
2. **Show ROI** - Demonstrate cost/time savings
3. **Make it easy** - Provide templates, examples, training
4. **Support** - Office hours, Slack channel for help

**Script:**
> "I understand change is hard. Bebop is saving our pilot team 50% time and 90% token costs. In the first week, Alice saved 4 hours. Let me show you how easy it is to get started..."

### Challenge 2: Lack of Documentation

**Symptoms:**
- No coding standards documented
- Implicit knowledge not captured
- Inconsistent practices

**Solutions:**
1. **Start with what exists** - Even minimal docs
2. **Extract from code reviews** - Common feedback patterns
3. **Iterative approach** - Improve packs over time
4. **Community contributions** - Let team members add rules

**Example:**
```markdown
# Extract rules from code reviews

## Common Code Review Comments

→ "This should be in a separate file"
  → Rule: EXTRACT_LOGIC_INTO_SEPARATE_FILES

→ "Add tests for this"
  → Rule: WRITE_TESTS_FOR_NEW_CODE

→ "Use TypeScript types"
  → Rule: USE_TYPESCRIPT_TYPES
```

### Challenge 3: Inconsistent Adoption

**Symptoms:**
- Some team members use bebop, others don't
- Inconsistent code quality
- Confusion about best practices

**Solutions:**
1. **Mandatory for certain tasks** - API endpoints, security reviews
2. **Code review checklist** - "Did you use bebop for this?"
3. **Team incentives** - Recognize high usage
4. **Management support** - Make it part of workflow

**Code review checklist:**
```markdown
## PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests included
- [ ] **Bebo p used?**
  - [ ] Yes - Which pack/plan?
  - [ ] No - Why?
```

---

## Success Metrics

### Quantitative

**Target (after 4 weeks):**

| Metric | Baseline | Target | Actual |
|--------|----------|--------|--------|
| Team adoption | 0% | 80% | ____% |
| Avg token usage/session | 1,328 | 150 | ____ |
| Avg cost/session | $0.40 | $0.05 | ____ |
| Avg time savings | 0% | 50% | ____ |
| Number of packs | 0 | 10 | ____ |
| Number of plans | 0 | 5 | ____ |

### Qualitative

**Team feedback:**
- Ease of use rating: ___/10
- Satisfaction rating: ___/10
- Would recommend to others: Yes/No
- Biggest improvement: _________________
- Biggest frustration: _________________

---

## Quick Reference

### Migration Checklist

**Week 1: Assessment**
- [ ] Audit current AI usage
- [ ] Inventory documentation
- [ ] Prioritize opportunities

**Week 2: Pilot**
- [ ] Setup pilot team
- [ ] Create initial pack
- [ ] Train pilot team
- [ ] Collect feedback

**Week 3-4: Scale**
- [ ] Create team packs
- [ ] Create common plans
- [ ] Onboard full team
- [ ] Establish best practices

**Ongoing:**
- [ ] Monitor usage
- [ ] Iterate on packs/plans
- [ ] Share knowledge

### Common Commands

```bash
# Installation
npm install -g @bebop/cli
bebop init
cd my-project
bebop init --project

# Usage
bebop chat &use my-company/core Create a feature
bebop chat --dry-run &use my-company/core Create a feature
bebop plan run my-company/create-api-endpoint route=POST:/users

# Management
bebop pack list
bebop plan list
bebop stats
bebop session cleanup --days 7
```

### Resources

- [Getting Started Guide](getting-started.md)
- [Pack Authoring Guide](pack-authoring.md)
- [Plan Authoring Guide](plan-authoring.md)
- [Troubleshooting Guide](troubleshooting.md)
- [Performance Guide](performance.md)

---

## Need Help?

- **Slack**: #bebop-help
- **Email**: bebop-support@company.com
- **Office Hours**: Tuesday 2-3pm EST
- **Documentation**: https://docs.bebop.dev

---

**Remember:** Migration is a journey, not a destination. Start small, iterate often, and celebrate wins along the way!
