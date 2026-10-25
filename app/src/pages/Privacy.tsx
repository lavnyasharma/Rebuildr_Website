import Legal from './Legal'
import { LEGAL } from '../data/legal'

export default function Privacy() {
  return (
    <Legal
      title="Privacy Policy"
      intro={<p>This policy explains what {LEGAL.product} (“we”, “us”) collects when you visit our website or use the {LEGAL.product} desktop app for macOS and Windows, how we use it, and the choices you have. {LEGAL.product} is built local-first: the projects it generates stay on your computer by default.</p>}
      sections={[
        { id: 'who', title: 'Who we are', body: <p>The controller of your personal data is {LEGAL.company}, {LEGAL.address}. You can reach us at {LEGAL.contactEmail}.</p> },
        { id: 'collect', title: 'What we collect', body: (<>
          <p><strong>Information you give us.</strong> If you join the waitlist or contact us, we collect your email address and anything you include in your message.</p>
          <p><strong>Website usage data.</strong> Our servers and hosting provider may automatically record technical data such as IP address, browser type, pages requested and timestamps, for security and reliability. We do not run advertising or cross-site tracking on this website.</p>
          <p><strong>Analytics (only with your consent).</strong> If you accept analytics, we use Google Analytics to measure how the site is used, such as pages viewed, approximate location, device and browser, and whether you joined the waitlist. We do not send your email address or name to Google Analytics. IP addresses are anonymized. You can decline, and the site works the same either way.</p>
          <p><strong>Account and subscription data (when available).</strong> If we offer accounts or paid plans, we will process the details needed to run them, such as your email, plan and entitlement status. Card details are handled by our payment provider and are not stored by us.</p>
          <p><strong>Diagnostics (opt-in).</strong> The app does not send diagnostic reports unless you choose to. Reports are designed to exclude secrets and the contents of your generated projects.</p>
        </>) },
        { id: 'local', title: 'What stays on your device', body: (<>
          <p>Projects Rebuildr generates, your chosen destination folders, and project history are stored on your computer. We do not receive your generated source code unless you choose to send it to us, for example in a support request.</p>
          <p>When you enter a URL, the app loads that page on your device to inspect it. Content from that page is treated as untrusted input and is not used as instructions.</p>
        </>) },
        { id: 'ai', title: 'AI providers', body: <p>Reconstruction uses an AI runtime that you sign in to through a supported, documented method. Content needed to complete a task, such as information about the reference page you asked us to rebuild, may be sent to that provider and is then governed by the provider’s own terms and privacy policy. Your AI usage and billing are separate from any {LEGAL.product} subscription. We do not ask you to paste long-lived secrets into the app and we do not extract tokens from other applications.</p> },
        { id: 'use', title: 'How we use information', body: (<ul>
          <li>To provide, secure and improve the website and the app.</li>
          <li>To send you the waitlist and launch updates you asked for. You can unsubscribe at any time.</li>
          <li>To respond to support and legal requests.</li>
          <li>To prevent abuse and comply with law.</li>
        </ul>) },
        { id: 'basis', title: 'Legal bases (EEA, UK)', body: <p>Where data protection law requires a legal basis, we rely on your consent (for example waitlist emails), performance of a contract (providing the app you use), our legitimate interests (security, reliability and product improvement, balanced against your rights), and legal obligations.</p> },
        { id: 'share', title: 'Who we share it with', body: (<>
          <p>We do not sell your personal data. We share it only with service providers that help us operate, such as hosting, email delivery, payments and support tools, under agreements that limit their use of it, and with authorities where the law requires.</p>
          <p>If we are involved in a merger, acquisition or sale of assets, personal data may be transferred as part of it, and we will tell you if its handling materially changes.</p>
        </>) },
        { id: 'transfers', title: 'International transfers', body: <p>Our providers may process data in countries other than yours. Where required, we use safeguards such as standard contractual clauses.</p> },
        { id: 'retention', title: 'Retention', body: <p>We keep waitlist and contact data until you unsubscribe or ask us to delete it, or until it is no longer needed for the purposes above. Server logs are kept for a limited period. We may keep records longer where the law requires it.</p> },
        { id: 'rights', title: 'Your rights', body: (<>
          <p>Depending on where you live, you may have the right to access, correct, delete or export your personal data, to object to or restrict certain processing, to withdraw consent, and to complain to your local data protection authority. California residents have rights to know, delete and correct, and to opt out of sale or sharing; we do not sell or share personal data for cross-context advertising.</p>
          <p>To exercise a right, email {LEGAL.contactEmail}. We may need to verify your identity first.</p>
        </>) },
        { id: 'cookies', title: 'Cookies', body: <p>This website does not set advertising cookies. Analytics cookies from Google Analytics are set only if you choose “Accept” in the analytics bar. If you decline, nothing is loaded from Google. To change your mind, clear this site’s data in your browser and you will be asked again.</p> },
        { id: 'security', title: 'Security', body: <p>We use reasonable technical and organizational measures to protect personal data, including keeping secrets out of logs and separating the app’s internal configuration from your projects. No system is perfectly secure, so we cannot guarantee absolute security.</p> },
        { id: 'children', title: 'Children', body: <p>{LEGAL.product} is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us data, contact us and we will delete it.</p> },
        { id: 'changes', title: 'Changes to this policy', body: <p>We may update this policy. We will post the new version here with a new effective date and, for material changes, notify you by a reasonable means.</p> },
        { id: 'contact', title: 'Contact', body: <p>Questions about privacy: {LEGAL.contactEmail}, {LEGAL.company}, {LEGAL.address}.</p> },
      ]}
    />
  )
}
