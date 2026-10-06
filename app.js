/**
 * ClauseClear - Intelligent Legal & Terms Analyzer
 * Scans legal text, detects common traps/red flags, scores agreements,
 * and produces plain-English breakdowns.
 */

const CLAUSE_PATTERNS = {
  redFlags: [
    {
      id: 'auto_renewal',
      title: 'Automatic Renewal / Billing Lock-in',
      severity: 'high',
      regex: /(auto(matically)?[\s-]renew|recurring billing|billed automatically unless cancelled|subscription will automatically continue)/i,
      explanation: 'Your subscription will keep renewing and charging your card automatically unless you proactively cancel before the cutoff date.',
      recommendation: 'Check the cancellation deadline (e.g., 48 hours or 30 days prior) and set a calendar reminder.'
    },
    {
      id: 'arbitration_waiver',
      title: 'Mandatory Binding Arbitration & Jury Waiver',
      severity: 'high',
      regex: /(binding arbitration|waive any right to a jury trial|class action waiver|no class actions|dispute resolution by binding arbitration)/i,
      explanation: 'You surrender your constitutional right to take this company to court or join a class-action lawsuit if they wrong you.',
      recommendation: 'Look for an "opt-out" clause; some services allow opting out of arbitration within 30 days of signing up.'
    },
    {
      id: 'cancellation_fees',
      title: 'Early Termination Penalty / Non-Refundable Policy',
      severity: 'high',
      regex: /(early termination fee|non-refundable|no refunds will be provided|penalty for early cancellation|cancellation charge)/i,
      explanation: 'If you leave early or want a refund, they may impose a heavy fee or refuse refunds completely.',
      recommendation: 'Clarify whether trial periods give 100% refunds or if payments are immediately forfeited.'
    },
    {
      id: 'unilateral_changes',
      title: 'Unilateral Changes Without Prior Notice',
      severity: 'high',
      regex: /(reserve the right to modify (these )?terms at any time|without prior notice|by continuing to use the service you accept the modified terms)/i,
      explanation: 'The company can rewrite prices, rules, and restrictions whenever they want without emailing or notifying you directly.',
      recommendation: 'Be aware that continuing to use the service means you automatically accept changes you were never informed of.'
    }
  ],
  warnings: [
    {
      id: 'data_sharing',
      title: 'Data Sharing & Selling to Third Parties',
      severity: 'medium',
      regex: /(share (your )?(personal )?data with (our )?(third[- ]party )?partners|monetize your information|targeted advertising partners|sell or transfer personal information)/i,
      explanation: 'Your personal info, browsing habits, or profile data may be shared with advertisers or third-party data brokers.',
      recommendation: 'Check privacy settings on your profile to opt out of targeted ad data collection.'
    },
    {
      id: 'ip_ownership',
      title: 'Broad License to Your Content / Intellectual Property',
      severity: 'medium',
      regex: /(worldwide,?( royalty-free)?( perpetual)?( irrevocable)? license to use, reproduce, modify|grant us a license to your content|you grant [a-z0-9\s]+ a non-exclusive)/i,
      explanation: 'You grant the company permission to reuse, market, or adapt content or media you upload.',
      recommendation: 'Avoid uploading proprietary, copyrighted, or sensitive confidential company work.'
    },
    {
      id: 'limitation_liability',
      title: 'Extreme Limitation of Liability',
      severity: 'medium',
      regex: /(in no event shall (we|the company|licensor) be liable|aggregate liability shall not exceed|as-is and as-available|maximum liability is limited to (the amount paid|\$100))/i,
      explanation: 'Even if their software loses your critical data or breaches security, their financial payout to you is capped to very little or nothing.',
      recommendation: 'Do not rely entirely on the platform without your own independent backups.'
    },
    {
      id: 'indemnification',
      title: 'Broad Indemnification Clause',
      severity: 'medium',
      regex: /(indemnify, defend, and hold harmless|hold us harmless from any claims, losses, liability)/i,
      explanation: 'You agree to pay the company\'s legal fees and damages if someone sues them because of your actions.',
      recommendation: 'Ensure your business or personal liability insurance covers this, or consult legal counsel for enterprise contracts.'
    }
  ],
  positives: [
    {
      id: 'data_deletion',
      title: 'Right to Data Deletion / GDPR & CCPA Compliance',
      severity: 'good',
      regex: /(right to delete|request erasure|delete your account and personal data|gdpr|ccpa)/i,
      explanation: 'You have a verified mechanism to permanently remove your records and stored personal information upon request.'
    },
    {
      id: 'notice_period',
      title: 'Advance Notice for Policy & Price Revisions',
      severity: 'good',
      regex: /(will notify you (at least )?(30|14|7) days in advance|advance written notice before changes take effect)/i,
      explanation: 'The service promises to inform you well before raising prices or altering terms so you have time to cancel.'
    },
    {
      id: 'money_back',
      title: 'Refund Guarantee / Cooling-Off Period',
      severity: 'good',
      regex: /(30-day money-back guarantee|full refund within [0-9]+ days|cooling-off period|prorated refund)/i,
      explanation: 'Provides customer-friendly safety nets if the service does not meet expectations.'
    }
  ]
};

// Sample contracts for instant one-click testing
const SAMPLE_CONTRACTS = {
  saas: `TERMS OF SERVICE AND SUBSCRIPTION AGREEMENT (SAMPLE SAAS)
Last Updated: January 1, 2026

1. SUBSCRIPTION AND BILLING
By signing up, you agree that your subscription will automatically continue on a monthly recurring billing cycle. Your payment method will be billed automatically unless cancelled at least 48 hours prior to the billing date. All fees are strictly non-refundable and no refunds will be provided for partial periods.

2. MODIFICATION OF TERMS
We reserve the right to modify these terms at any time without prior notice. By continuing to use the service you accept the modified terms.

3. DISPUTES & ARBITRATION
Any controversy or claim arising out of or relating to this contract shall be settled by binding arbitration. You expressly waive any right to a jury trial and agree to no class actions.

4. USER CONTENT & PRIVACY
You retain ownership of your content, but grant us a worldwide, royalty-free license to use, reproduce, modify, and display your content to provide and promote the service. We may share your personal data with third-party partners and targeted advertising partners. You retain the right to delete your account and personal data pursuant to applicable privacy laws.

5. LIMITATION OF LIABILITY
In no event shall the company be liable for any indirect, incidental, or punitive damages. Our aggregate liability shall not exceed the amount paid by you in the preceding 3 months or $50. You agree to indemnify, defend, and hold harmless the company against any third-party claims.`,

  rental: `RESIDENTIAL LEASE AGREEMENT (SAMPLE RENTAL)
Dated: March 2026

1. TERM AND RENEWAL
The initial term shall run for 12 months. Upon expiration, this lease will automatically renew on a month-to-month basis unless 60 days advance written notice is provided.

2. EARLY TERMINATION
An early termination fee equivalent to 2 months rent will apply if tenant vacates prior to the completion of the term. Deposit is subject to forfeiture.

3. INDEMNIFICATION
Tenant agrees to indemnify, defend, and hold harmless the Landlord from any claims, losses, liability, or damage arising on the premises.

4. RULES & REGULATIONS
Landlord reserves the right to modify property rules at any time upon 14 days advance written notice.`,

  friendly: `FAIR & TRANSPARENT TERMS OF USE (CUSTOMER-FRIENDLY SAMPLE)
Updated: February 2026

1. SUBSCRIPTIONS & CANCELLATIONS
We offer a 30-day money-back guarantee. If you are not satisfied, contact support for a full refund within 30 days. Subscriptions renew automatically, but you can cancel anytime from your dashboard with zero cancellation fees.

2. TRANSPARENT UPDATES
We will notify you at least 30 days in advance of any material changes or price increases via email.

3. PRIVACY & DATA CONTROL
We never sell or transfer personal information to third parties. You have the full right to delete your account and request erasure of all stored data at any time.

4. GOVERNING LAW & DISPUTES
Disputes are handled in local courts of competent jurisdiction. We do not enforce mandatory binding arbitration waivers.`
};

/**
 * Core parsing and analysis function
 */
function analyzeLegalText(text) {
  if (!text || text.trim().length < 30) {
    return null;
  }

  const results = {
    wordCount: text.trim().split(/\s+/).length,
    readingTimeMinutes: Math.max(1, Math.round(text.trim().split(/\s+/).length / 200)),
    redFlagsFound: [],
    warningsFound: [],
    positivesFound: [],
    score: 100,
    safetyRating: 'Safe',
    safetyColor: 'green'
  };

  // Detect Red Flags
  CLAUSE_PATTERNS.redFlags.forEach(item => {
    if (item.regex.test(text)) {
      results.redFlagsFound.push(item);
      results.score -= 22;
    }
  });

  // Detect Warnings
  CLAUSE_PATTERNS.warnings.forEach(item => {
    if (item.regex.test(text)) {
      results.warningsFound.push(item);
      results.score -= 10;
    }
  });

  // Detect Positives
  CLAUSE_PATTERNS.positives.forEach(item => {
    if (item.regex.test(text)) {
      results.positivesFound.push(item);
      results.score += 8;
    }
  });

  // Clamp score between 10 and 100
  results.score = Math.max(12, Math.min(100, results.score));

  if (results.score >= 80) {
    results.safetyRating = 'Consumer-Friendly';
    results.safetyColor = 'emerald';
  } else if (results.score >= 55) {
    results.safetyRating = 'Moderate Caution';
    results.safetyColor = 'amber';
  } else {
    results.safetyRating = 'High Risk / Unfavorable';
    results.safetyColor = 'rose';
  }

  return results;
}

// UI Event Handlers
document.addEventListener('DOMContentLoaded', () => {
  const contractInput = document.getElementById('contractInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resultsSection = document.getElementById('resultsSection');
  const sampleSaasBtn = document.getElementById('sampleSaas');
  const sampleRentalBtn = document.getElementById('sampleRental');
  const sampleFriendlyBtn = document.getElementById('sampleFriendly');
  const fileUpload = document.getElementById('fileUpload');

  // Load sample contract
  if (sampleSaasBtn) {
    sampleSaasBtn.addEventListener('click', () => {
      contractInput.value = SAMPLE_CONTRACTS.saas;
      runAnalysis();
    });
  }

  if (sampleRentalBtn) {
    sampleRentalBtn.addEventListener('click', () => {
      contractInput.value = SAMPLE_CONTRACTS.rental;
      runAnalysis();
    });
  }

  if (sampleFriendlyBtn) {
    sampleFriendlyBtn.addEventListener('click', () => {
      contractInput.value = SAMPLE_CONTRACTS.friendly;
      runAnalysis();
    });
  }

  // Handle file upload
  if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        contractInput.value = event.target.result;
        runAnalysis();
      };
      reader.readAsText(file);
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      contractInput.value = '';
      resultsSection.classList.add('hidden');
      contractInput.focus();
    });
  }

  // Analyze button
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      runAnalysis();
    });
  }

  function runAnalysis() {
    const text = contractInput.value;
    if (!text || text.trim().length < 30) {
      alert('Please paste at least one or two complete paragraphs of a contract or Terms of Service.');
      return;
    }

    const res = analyzeLegalText(text);
    renderResults(res);
  }

  function renderResults(res) {
    resultsSection.classList.remove('hidden');

    // Stats
    document.getElementById('statWords').textContent = res.wordCount.toLocaleString();
    document.getElementById('statReadTime').textContent = `~${res.readingTimeMinutes} min`;
    document.getElementById('statScore').textContent = `${res.score}/100`;

    const badge = document.getElementById('safetyBadge');
    badge.textContent = res.safetyRating;
    badge.className = `px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
      res.safetyColor === 'emerald'
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
        : res.safetyColor === 'amber'
        ? 'bg-amber-100 text-amber-800 border border-amber-300'
        : 'bg-rose-100 text-rose-800 border border-rose-300'
    }`;

    // Render Red Flags
    const redFlagContainer = document.getElementById('redFlagsList');
    redFlagContainer.innerHTML = '';
    if (res.redFlagsFound.length === 0) {
      redFlagContainer.innerHTML = '<li class="text-sm text-slate-500 italic">No critical predatory clauses detected!</li>';
    } else {
      res.redFlagsFound.forEach(flag => {
        const li = document.createElement('li');
        li.className = 'p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col gap-1';
        li.innerHTML = `
          <div class="flex items-center gap-2 font-bold text-rose-700">
            <span class="text-lg">🚩</span>
            <span>${flag.title}</span>
          </div>
          <p class="text-sm text-slate-700 mt-1">${flag.explanation}</p>
          <div class="mt-2 text-xs font-medium text-rose-800 bg-rose-100/70 p-2 rounded-lg">
            <strong>Recommended Action:</strong> ${flag.recommendation}
          </div>
        `;
        redFlagContainer.appendChild(li);
      });
    }

    // Render Warnings
    const warningsContainer = document.getElementById('warningsList');
    warningsContainer.innerHTML = '';
    if (res.warningsFound.length === 0) {
      warningsContainer.innerHTML = '<li class="text-sm text-slate-500 italic">No secondary warning clauses detected.</li>';
    } else {
      res.warningsFound.forEach(warn => {
        const li = document.createElement('li');
        li.className = 'p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col gap-1';
        li.innerHTML = `
          <div class="flex items-center gap-2 font-bold text-amber-700">
            <span class="text-lg">⚠️</span>
            <span>${warn.title}</span>
          </div>
          <p class="text-sm text-slate-700 mt-1">${warn.explanation}</p>
          <div class="mt-2 text-xs font-medium text-amber-800 bg-amber-100/70 p-2 rounded-lg">
            <strong>What to check:</strong> ${warn.recommendation}
          </div>
        `;
        warningsContainer.appendChild(li);
      });
    }

    // Render Positives
    const positivesContainer = document.getElementById('positivesList');
    positivesContainer.innerHTML = '';
    if (res.positivesFound.length === 0) {
      positivesContainer.innerHTML = '<li class="text-sm text-slate-500 italic">No standard consumer protections explicitly mentioned.</li>';
    } else {
      res.positivesFound.forEach(pos => {
        const li = document.createElement('li');
        li.className = 'p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col gap-1';
        li.innerHTML = `
          <div class="flex items-center gap-2 font-bold text-emerald-700">
            <span class="text-lg">✅</span>
            <span>${pos.title}</span>
          </div>
          <p class="text-sm text-slate-700 mt-1">${pos.explanation}</p>
        `;
        positivesContainer.appendChild(li);
      });
    }

    // Smooth scroll down to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
