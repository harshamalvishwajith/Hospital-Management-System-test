# SE4030 – Secure Software Development Assignment

## Group Members
1. De Ranasinghe I M R K – IT22088246
2. Sandanayake S D I D   – IT22898548
3. Full Name – ITXXXXXXXX
4. Full Name – ITXXXXXXXX

---

## Project Links
- Original Project Repository: [https://github.com/Fairooz2150/Hospital-Management-System.git]
- Modified Project Repository (After Fixes): [https://github.com/harshamalvishwajith/Hospital-Management-System-test/security]

---

## Vulnerabilities Identified and Fixed
Each member contributed by identifying and fixing vulnerabilities as follows:

- Member 1 - De Ranasinghe I M R K (IT22088246)
  
#### Vulnerability 1: Session cookies transmitted without SSL encryption
- **Issue:** Session cookies were sent without enforcing HTTPS, exposing them to interception.  
- **Fix:** Configured session cookies with `secure: true` in production, ensuring they are transmitted only over HTTPS.

#### Vulnerability 2: Missing CSRF protection on state-changing requests
- **Issue:** POST, PUT, and DELETE requests lacked CSRF token validation, allowing attackers to exploit active sessions for unauthorized actions.  
- **Fix:** Implemented `lusca.csrf()` middleware to enforce CSRF token validation, ensuring only legitimate requests are processed.

#### Additional Fixes Contributed
- **Cross-Site Scripting (XSS):** Blocked malicious `<script>` tags and JavaScript injection using strict input validation and sanitization.  
- **NoSQL Injection:** Prevented MongoDB query manipulation by rejecting dangerous operators like `$where`, `$ne`, and `$gt`.  
- **IP Address Spoofing:** Added validation for IP address formats to accept only legitimate values, preventing spoofing attempts.

## Member 2 – Sandanayake S D I D (IT22898548) 

### Vulnerability 3: Privilege Escalation in Registration (Client-Controlled Role)
- **Where:** `userController.js` → `patientRegister` reads `role` from `req.body` and persists it, then logs in the user.  
- **Impact:** An attacker could register with `role: "Admin"` and receive an `adminToken` via `generateToken(...)`, gaining full admin access.  
- **Fix:** Ignore client-supplied role. Force `"Patient"` for public registration. Only allow privileged accounts (admins) to create users with elevated roles (e.g., Admin, Doctor).  

### Vulnerability 4: JWT Leakage in Response Body
- **Where:** `jwtToken.js` returns `{ user, token }` while also setting the auth cookie.  
- **Impact:** Increases attack surface — tokens can leak via XSS, logs, browser extensions, or intercepted API responses.  
- **Fix:** Do not return the JWT in the body when using cookies. Return only minimal user info instead.  


- Member 3 (Name – ITXXXXXXXX)
  * Vulnerability 5: [Short description]
  * Vulnerability 6: [Short description]

- Member 4 (Name – ITXXXXXXXX)
  * Vulnerability 7: [Short description]
  * OAuth/OpenID Connect Flow: [Describe the grant type used and the feature added/updated]

---

## OAuth/OpenID Connect Implementation
- Grant Type Implemented: [Authorization Code / Implicit / Client Credentials / PKCE]
- Identity Provider Used: [Google / Facebook / WSO2 / etc.]
- Integrated Feature: [Briefly describe the new or updated feature]

---

## Video Presentation
YouTube Link: [Insert Video Link Here]
- Total duration: Maximum 10 minutes
- Each member’s explanation: Maximum 2.5 minutes

---

## Report
- The detailed PDF report is included in the submission zip file.
- The report covers: identified vulnerabilities, fixes applied, any unfixed vulnerabilities with reasons, and secure development best practices.

---

## Notes
- The selected project is not a well-known deliberately vulnerable app (e.g., DVWA, WebGoat).
- The last commit date of the original project is earlier than the start date of the semester.
- A combination of security testing tools and manual analysis was used (e.g., OWASP ZAP, Dependency-Check, SQLMap).
- Secure coding and engineering best practices have been documented.
