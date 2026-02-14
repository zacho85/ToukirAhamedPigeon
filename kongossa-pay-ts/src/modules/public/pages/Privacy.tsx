import PublicLayout from "@/layouts/PublicLayout"
import { motion } from "framer-motion"

export default function Privacy() {
  return (
    <PublicLayout>
        <section className="bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-6 py-24">
            <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
            >
            Privacy Policy
            </motion.h1>

            <p className="text-black/60 dark:text-white/60 mb-10">
            Your privacy matters to us.
            </p>

            <div className="space-y-12 text-sm leading-relaxed text-black/80 dark:text-white/80">
              <section>
                <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                <p className="mb-2">
                  KongossaPay Limited ("KongossaPay," "we," "us," or "our") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial services platform, mobile applications, website, and related services ("Services").
                </p>
                <p>
                  By using KongossaPay Services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with this Privacy Policy, please do not use our Services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">2.1 Personal Information You Provide</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Account Registration Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Full legal name</li>
                          <li>Email address</li>
                          <li>Phone number</li>
                          <li>Date of birth</li>
                          <li>Gender</li>
                          <li>Residential address</li>
                          <li>Nationality and country of residence</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Identity Verification Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Government-issued identification (passport, national ID, driver's license)</li>
                          <li>Proof of address documents (utility bills, bank statements)</li>
                          <li>Photographs or biometric data (facial recognition, fingerprints)</li>
                          <li>Tax identification numbers</li>
                          <li>Social security numbers (where applicable)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Financial Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Bank account details</li>
                          <li>Payment card information</li>
                          <li>Transaction history</li>
                          <li>Account balances</li>
                          <li>Credit and debit information</li>
                          <li>Source of funds documentation</li>
                          <li>Financial statements (for business accounts)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Business Information (for Business Accounts)</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Business name and registration number</li>
                          <li>Business license and permits</li>
                          <li>Articles of incorporation</li>
                          <li>Beneficial ownership information</li>
                          <li>Business address and contact details</li>
                          <li>Tax documentation</li>
                          <li>Financial records</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Communication Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Customer support correspondence</li>
                          <li>Survey responses</li>
                          <li>Feedback and reviews</li>
                          <li>Marketing preferences</li>
                          <li>Communication logs</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">2.2 Information We Collect Automatically</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Device Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Device type and model</li>
                          <li>Operating system and version</li>
                          <li>Unique device identifiers</li>
                          <li>Mobile network information</li>
                          <li>Browser type and version</li>
                          <li>IP address</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Usage Data</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Login and access times</li>
                          <li>Features and services used</li>
                          <li>Transaction patterns and frequency</li>
                          <li>Search queries</li>
                          <li>Pages visited and links clicked</li>
                          <li>Time spent on pages</li>
                          <li>Referring and exit pages</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Location Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>GPS coordinates (with permission)</li>
                          <li>Wi‑Fi access point information</li>
                          <li>Cell tower information</li>
                          <li>IP address‑based location</li>
                          <li>Country and city information</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Technical Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Log files</li>
                          <li>Cookies and similar technologies</li>
                          <li>Session data</li>
                          <li>Error reports and diagnostic information</li>
                          <li>Performance data</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">2.3 Information from Third Parties</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Identity Verification Services</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Identity verification results</li>
                          <li>Document authentication</li>
                          <li>Fraud screening results</li>
                          <li>Watchlist screening results</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Financial Institutions</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Account verification</li>
                          <li>Transaction processing information</li>
                          <li>Balance information</li>
                          <li>Account ownership confirmation</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Credit Bureaus and Data Providers</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Credit history and scores</li>
                          <li>Risk assessment data</li>
                          <li>Adverse media screening</li>
                          <li>Public records information</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Business Partners and Affiliates</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Referral information</li>
                          <li>Shared customer data (with consent)</li>
                          <li>Transaction information</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Social Media Platforms</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Profile information</li>
                          <li>Contact lists (with permission)</li>
                          <li>Public posts and activities</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Publicly Available Sources</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Corporate registries</li>
                          <li>Regulatory databases</li>
                          <li>Sanctions lists</li>
                          <li>Media sources</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">3.1 Service Provision and Account Management</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Creating and maintaining your account</li>
                      <li>Processing transactions and payments</li>
                      <li>Managing your digital wallet</li>
                      <li>Providing customer support</li>
                      <li>Sending service‑related communications</li>
                      <li>Processing withdrawals and deposits</li>
                      <li>Managing account settings and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">3.2 Identity Verification and Compliance</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Verifying your identity</li>
                      <li>Conducting KYC checks</li>
                      <li>Performing AML screening</li>
                      <li>Sanctions list screening</li>
                      <li>Assessing and managing risk</li>
                      <li>Complying with legal and regulatory requirements</li>
                      <li>Responding to legal requests and court orders</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">3.3 Security and Fraud Prevention</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Detecting and preventing fraud</li>
                      <li>Monitoring suspicious activities</li>
                      <li>Protecting against security threats</li>
                      <li>Investigating security incidents</li>
                      <li>Enforcing our Terms of Service</li>
                      <li>Protecting our rights and property</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">3.4 Service Improvement and Development</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Analyzing usage patterns and trends</li>
                      <li>Improving existing features and services</li>
                      <li>Developing new products and features</li>
                      <li>Conducting research and analytics</li>
                      <li>Testing new functionality</li>
                      <li>Personalizing user experience</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">3.5 Communication and Marketing</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Sending transactional notifications</li>
                      <li>Providing account updates</li>
                      <li>Sending promotional offers (with consent)</li>
                      <li>Conducting surveys and research</li>
                      <li>Sending newsletters and updates</li>
                      <li>Responding to inquiries and requests</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">3.6 Legal and Compliance Purposes</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Complying with legal obligations</li>
                      <li>Responding to law enforcement requests</li>
                      <li>Enforcing our agreements and policies</li>
                      <li>Resolving disputes</li>
                      <li>Protecting against legal liability</li>
                      <li>Maintaining records as required by law</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Legal Basis for Processing (GDPR)</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">4.1 Contractual Necessity</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Account creation and management</li>
                      <li>Transaction processing</li>
                      <li>Service delivery</li>
                      <li>Customer support</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">4.2 Legal Obligation</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Identity verification (KYC)</li>
                      <li>Anti‑money laundering compliance</li>
                      <li>Tax reporting</li>
                      <li>Regulatory reporting</li>
                      <li>Responding to legal requests</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">4.3 Legitimate Interests</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Fraud prevention and security</li>
                      <li>Service improvement and development</li>
                      <li>Data analytics</li>
                      <li>Business operations</li>
                      <li>Marketing (where consent not required)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">4.4 Consent</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Marketing communications</li>
                      <li>Optional data processing</li>
                      <li>Non‑essential cookie usage</li>
                      <li>Sharing data with third parties for marketing</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">4.5 Vital Interests</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Emergency situations</li>
                      <li>Health and safety concerns</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. How We Share Your Information</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">5.1 Service Providers and Business Partners</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Payment Processors</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Bank and financial institution partners</li>
                          <li>Payment gateway providers</li>
                          <li>Card networks (Visa, Mastercard, etc.)</li>
                          <li>Mobile money operators</li>
                          <li>Local payment facilitators</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Technology and Infrastructure Providers</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Cloud hosting services</li>
                          <li>CRM platforms</li>
                          <li>Email and SMS providers</li>
                          <li>Analytics and data processing services</li>
                          <li>Security and fraud detection services</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Identity Verification Services</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>KYC/AML compliance providers</li>
                          <li>Document verification services</li>
                          <li>Biometric authentication providers</li>
                          <li>Credit bureaus and data providers</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Customer Support Services</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Support ticketing systems</li>
                          <li>Live chat providers</li>
                          <li>Call center services</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Marketing and Communication Partners</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Email marketing platforms</li>
                          <li>Advertising networks</li>
                          <li>Market research firms</li>
                          <li>Social media platforms</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">5.2 Regulatory and Law Enforcement</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Financial regulatory authorities</li>
                      <li>Law enforcement agencies</li>
                      <li>Tax authorities</li>
                      <li>Courts and judicial bodies</li>
                      <li>Government agencies</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">5.3 Business Transfers</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Mergers and acquisitions</li>
                      <li>Sale of assets</li>
                      <li>Corporate restructuring</li>
                      <li>Bankruptcy proceedings</li>
                    </ul>
                    <p className="mt-2">Your information may be transferred to successor entities.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">5.4 Affiliates and Subsidiaries</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Parent companies</li>
                      <li>Subsidiary companies</li>
                      <li>Corporate affiliates</li>
                      <li>Joint venture partners</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">5.5 With Your Consent</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Explicit authorization to share</li>
                      <li>Connected third‑party services</li>
                      <li>Co‑marketing programs</li>
                      <li>Requested services requiring sharing</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">5.6 Aggregate and Anonymized Data</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Statistical information</li>
                      <li>Anonymized usage data</li>
                      <li>Aggregated transaction data</li>
                      <li>Market trends and insights</li>
                    </ul>
                    <p className="mt-2">This data cannot identify you individually.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">6.1 Security Measures</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Technical Safeguards</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Encryption of data in transit (TLS/SSL)</li>
                          <li>Encryption of data at rest (AES‑256)</li>
                          <li>SSL certificates</li>
                          <li>Multi‑factor authentication</li>
                          <li>Access controls and authentication</li>
                          <li>Regular security audits and penetration testing</li>
                          <li>Intrusion detection and prevention systems</li>
                          <li>Firewall protection</li>
                          <li>Secure data centers</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Organizational Safeguards</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Employee background checks</li>
                          <li>Confidentiality agreements</li>
                          <li>Security awareness training</li>
                          <li>Access on need‑to‑know basis</li>
                          <li>Incident response procedures</li>
                          <li>Disaster recovery plans</li>
                          <li>Business continuity planning</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Physical Safeguards</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Secure data center facilities</li>
                          <li>24/7 security monitoring</li>
                          <li>Restricted physical access</li>
                          <li>Environmental controls</li>
                          <li>Backup power systems</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">6.2 Payment Security</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>PCI DSS compliance for card data</li>
                      <li>Tokenization of sensitive information</li>
                      <li>Secure payment gateways</li>
                      <li>Transaction monitoring</li>
                      <li>Fraud detection systems</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">6.3 Account Security</h3>
                    <p className="mb-2">Your responsibilities:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Use strong, unique passwords</li>
                      <li>Enable two‑factor authentication</li>
                      <li>Keep login credentials confidential</li>
                      <li>Use secure internet connections</li>
                      <li>Keep contact information updated</li>
                      <li>Report suspicious activity immediately</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">6.4 Security Limitations</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>No system is 100% secure</li>
                      <li>Internet transmission is not completely secure</li>
                      <li>You are responsible for account security</li>
                      <li>Report security concerns immediately</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">7.1 Retention Periods</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Active Accounts</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Duration of account relationship</li>
                          <li>As long as needed to provide Services</li>
                          <li>To comply with ongoing obligations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Closed Accounts</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Minimum 5–7 years after account closure</li>
                          <li>Longer if required by law</li>
                          <li>Longer if needed for legal proceedings</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Specific Data Categories</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Transaction records: 7 years minimum</li>
                          <li>Identity documents: 7 years after relationship ends</li>
                          <li>Communication records: 3–5 years</li>
                          <li>Marketing data: Until withdrawal of consent</li>
                          <li>Fraud investigation data: As long as necessary</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">7.2 Retention Criteria</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Legal and regulatory requirements</li>
                      <li>Business and operational needs</li>
                      <li>Dispute resolution requirements</li>
                      <li>Fraud prevention needs</li>
                      <li>Tax and accounting purposes</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">7.3 Data Deletion</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Data is securely deleted or anonymized</li>
                      <li>Backup copies are deleted within reasonable timeframe</li>
                      <li>Some data may be retained in anonymized form</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Your Privacy Rights</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">8.1 General Rights (All Users)</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Right to Access</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Request information about data we hold</li>
                          <li>Obtain copies of your personal data</li>
                          <li>Understand how data is being used</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Right to Correction</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Request correction of inaccurate data</li>
                          <li>Update incomplete information</li>
                          <li>Modify account details</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Right to Deletion</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Request deletion of personal data</li>
                          <li>Subject to legal retention requirements</li>
                          <li>May prevent continued service use</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Right to Object</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Object to certain processing activities</li>
                          <li>Opt‑out of marketing communications</li>
                          <li>Withdraw consent where applicable</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Right to Restrict Processing</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Request limitation of data processing</li>
                          <li>During dispute resolution</li>
                          <li>When accuracy is contested</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Right to Data Portability</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Receive data in structured format</li>
                          <li>Transfer data to another service provider</li>
                          <li>Applies to data provided with consent or for contract performance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">8.2 Additional Rights (GDPR/EEA Users)</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Right to Withdraw Consent</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Withdraw consent at any time</li>
                          <li>Does not affect prior lawful processing</li>
                          <li>May impact service availability</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Right to Lodge Complaint</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>File complaint with supervisory authority</li>
                          <li>Contact your local data protection authority</li>
                          <li>We prefer you contact us first</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Rights Regarding Automated Decisions</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Right to human review of automated decisions</li>
                          <li>Right to challenge decisions</li>
                          <li>Right to express your point of view</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">8.3 Exercising Your Rights</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Email: privacy@kongossapay.com</li>
                      <li>In‑app privacy settings</li>
                      <li>Written request to our address</li>
                      <li>Identity verification required</li>
                      <li>Response within 30 days (may be extended)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">8.4 Limitations on Rights</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Required by law to retain data</li>
                      <li>Needed for legal claims or compliance</li>
                      <li>Affects rights of others</li>
                      <li>Commercially unreasonable</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">9. International Data Transfers</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">9.1 Cross‑Border Transfers</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>For service provision</li>
                      <li>To service providers globally</li>
                      <li>For business operations</li>
                      <li>For regulatory compliance</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">9.2 Transfer Safeguards</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">For EEA/UK Data</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>European Commission adequacy decisions</li>
                          <li>Standard Contractual Clauses (SCCs)</li>
                          <li>Binding Corporate Rules (BCRs)</li>
                          <li>Appropriate safeguards under GDPR</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">For Other Jurisdictions</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Equivalent protective measures</li>
                          <li>Contractual commitments</li>
                          <li>Local law compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">9.3 Data Processing Locations</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Primary processing locations</li>
                      <li>Cloud service provider locations</li>
                      <li>Service provider locations</li>
                      <li>Regulatory reporting locations</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">10. Cookies and Tracking Technologies</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">10.1 Types of Cookies We Use</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Essential Cookies</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Required for platform functionality</li>
                          <li>Session management</li>
                          <li>Security features</li>
                          <li>Load balancing</li>
                          <li>Cannot be disabled</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Performance Cookies</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Analytics and usage data</li>
                          <li>Performance monitoring</li>
                          <li>Error tracking</li>
                          <li>Service improvement</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Functional Cookies</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>User preferences</li>
                          <li>Language settings</li>
                          <li>Display customization</li>
                          <li>Feature functionality</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Marketing Cookies</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Advertising and retargeting</li>
                          <li>Campaign effectiveness</li>
                          <li>Third‑party advertising</li>
                          <li>Social media integration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">10.2 Other Tracking Technologies</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Web Beacons: Track email opens and clicks</li>
                      <li>Pixels: Measure ad effectiveness</li>
                      <li>Local Storage: Store preferences locally</li>
                      <li>SDKs: Mobile app analytics</li>
                      <li>Session Replay: Understand user experience</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">10.3 Managing Cookies</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Browser settings</li>
                      <li>Cookie preference center</li>
                      <li>Opt‑out tools</li>
                      <li>Privacy settings</li>
                    </ul>
                    <p className="mt-2">Disabling essential cookies may affect functionality.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">10.4 Third‑Party Cookies</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Analytics providers (e.g., Google Analytics)</li>
                      <li>Advertising networks</li>
                      <li>Social media platforms</li>
                      <li>Payment processors</li>
                    </ul>
                    <p className="mt-2">Refer to their privacy policies for details.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">22. Do Not Track Signals</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">22.1 Browser DNT Signals</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Most browsers support Do Not Track (DNT) signals</li>
                      <li>We currently do not respond to DNT signals</li>
                      <li>Industry standards are still evolving</li>
                      <li>We honor opt‑out preferences in other ways</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">22.2 Alternative Privacy Controls</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cookie settings</li>
                      <li>Privacy preferences</li>
                      <li>Browser privacy extensions</li>
                      <li>Opt‑out mechanisms</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">23. Biometric Data</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">23.1 Biometric Information Collection</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Facial recognition for identity verification</li>
                      <li>Fingerprint data for mobile authentication</li>
                      <li>Voice recognition for security purposes</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">23.2 Biometric Data Protection</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Explicit consent required</li>
                      <li>Enhanced encryption</li>
                      <li>Limited retention periods</li>
                      <li>Strict access controls</li>
                      <li>Deletion upon request or account closure</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">23.3 Biometric Data Rights</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Refuse biometric data collection (may limit services)</li>
                      <li>Know retention periods</li>
                      <li>Request deletion</li>
                      <li>Understand usage purposes</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">23.4 Illinois Residents (BIPA)</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Written consent required</li>
                      <li>Retention schedule provided</li>
                      <li>Data destruction protocols</li>
                      <li>No profit from biometric data</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">31. Lawful Basis Summary (GDPR)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-black/10 dark:border-white/10">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="p-2">Processing Activity</th>
                        <th className="p-2">Legal Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="p-2">Account creation</td><td className="p-2">Contractual necessity</td></tr>
                      <tr><td className="p-2">Transaction processing</td><td className="p-2">Contractual necessity</td></tr>
                      <tr><td className="p-2">Identity verification</td><td className="p-2">Legal obligation</td></tr>
                      <tr><td className="p-2">Anti‑money laundering</td><td className="p-2">Legal obligation</td></tr>
                      <tr><td className="p-2">Fraud prevention</td><td className="p-2">Legitimate interest</td></tr>
                      <tr><td className="p-2">Service improvement</td><td className="p-2">Legitimate interest</td></tr>
                      <tr><td className="p-2">Marketing communications</td><td className="p-2">Consent</td></tr>
                      <tr><td className="p-2">Customer support</td><td className="p-2">Contractual necessity</td></tr>
                      <tr><td className="p-2">Analytics</td><td className="p-2">Legitimate interest</td></tr>
                      <tr><td className="p-2">Regulatory reporting</td><td className="p-2">Legal obligation</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">32. Data Categories and Sources</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-black/10 dark:border-white/10">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="p-2">Category</th>
                        <th className="p-2">Examples</th>
                        <th className="p-2">Sources</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="p-2">Identity Data</td><td className="p-2">Name, date of birth, ID number</td><td className="p-2">You, verification services</td></tr>
                      <tr><td className="p-2">Contact Data</td><td className="p-2">Email, phone, address</td><td className="p-2">You</td></tr>
                      <tr><td className="p-2">Financial Data</td><td className="p-2">Account details, transactions</td><td className="p-2">You, financial institutions</td></tr>
                      <tr><td className="p-2">Technical Data</td><td className="p-2">IP address, device ID</td><td className="p-2">Automatic collection</td></tr>
                      <tr><td className="p-2">Usage Data</td><td className="p-2">Service interactions</td><td className="p-2">Automatic collection</td></tr>
                      <tr><td className="p-2">Profile Data</td><td className="p-2">Preferences, feedback</td><td className="p-2">You, analytics</td></tr>
                      <tr><td className="p-2">Marketing Data</td><td className="p-2">Preferences, responses</td><td className="p-2">You, interactions</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-left border border-black/10 dark:border-white/10">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="p-2">Data Type</th>
                        <th className="p-2">Purpose</th>
                        <th className="p-2">Retention</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="p-2">Identity documents</td><td className="p-2">Verification, compliance</td><td className="p-2">7 years after closure</td></tr>
                      <tr><td className="p-2">Transaction records</td><td className="p-2">Service provision, audit</td><td className="p-2">7 years minimum</td></tr>
                      <tr><td className="p-2">Login credentials</td><td className="p-2">Authentication</td><td className="p-2">Account lifetime</td></tr>
                      <tr><td className="p-2">Support tickets</td><td className="p-2">Customer service</td><td className="p-2">3 years</td></tr>
                      <tr><td className="p-2">Marketing data</td><td className="p-2">Campaigns</td><td className="p-2">Until withdrawal</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Appendix A: Definitions</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="font-medium">Personal Information/Data</dt>
                    <dd>Information relating to an identified or identifiable individual.</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Processing</dt>
                    <dd>Any operation performed on personal data, including collection, storage, use, disclosure, or deletion.</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Controller</dt>
                    <dd>The entity determining the purposes and means of processing personal data (KongossaPay).</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Processor</dt>
                    <dd>An entity processing personal data on behalf of the controller.</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Data Subject</dt>
                    <dd>An individual whose personal data is processed.</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Consent</dt>
                    <dd>Freely given, specific, informed, and unambiguous agreement to processing.</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Biometric Data</dt>
                    <dd>Unique physical characteristics used for identification (fingerprints, facial recognition).</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Sensitive Data</dt>
                    <dd>Data requiring special protection (financial data, identification numbers).</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Appendix B: Cookie Policy Details</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border border-black/10 dark:border-white/10">
                        <thead className="bg-black/5 dark:bg-white/5">
                          <tr>
                            <th className="p-2">Cookie Name</th>
                            <th className="p-2">Purpose</th>
                            <th className="p-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="p-2">session_id</td><td className="p-2">User authentication</td><td className="p-2">Session</td></tr>
                          <tr><td className="p-2">security_token</td><td className="p-2">CSRF protection</td><td className="p-2">Session</td></tr>
                          <tr><td className="p-2">user_prefs</td><td className="p-2">Essential preferences</td><td className="p-2">1 year</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Performance Cookies</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border border-black/10 dark:border-white/10">
                        <thead className="bg-black/5 dark:bg-white/5">
                          <tr>
                            <th className="p-2">Cookie Name</th>
                            <th className="p-2">Purpose</th>
                            <th className="p-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="p-2">analytics_id</td><td className="p-2">Usage tracking</td><td className="p-2">2 years</td></tr>
                          <tr><td className="p-2">performance_monitor</td><td className="p-2">Performance data</td><td className="p-2">1 year</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Marketing Cookies</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border border-black/10 dark:border-white/10">
                        <thead className="bg-black/5 dark:bg-white/5">
                          <tr>
                            <th className="p-2">Cookie Name</th>
                            <th className="p-2">Purpose</th>
                            <th className="p-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="p-2">marketing_id</td><td className="p-2">Campaign tracking</td><td className="p-2">2 years</td></tr>
                          <tr><td className="p-2">ad_preferences</td><td className="p-2">Ad personalization</td><td className="p-2">1 year</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>
        </div>
        </section>
    </PublicLayout>
  )
}
