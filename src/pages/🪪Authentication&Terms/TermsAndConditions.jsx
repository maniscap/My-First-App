import React, { useState } from 'react';

// --- THE MASSIVE LEGAL DATA (INTERNAL) ---
const termsData = {
  en: {
    lang: "English",
    acceptBtn: "I Understand & Accept",
    declineBtn: "Decline",
    content: `
      <h3>FARMCONNECT / FARMCAP: TERMS OF SERVICE & PRIVACY POLICY</h3>
      <p><strong>Effective Date: 2025</strong></p>

      <h4>1. PLATFORM PURPOSE AND ROLE</h4>
      <p>FarmConnect is a technology platform designed solely to facilitate discovery, visibility, and communication between independent users within the agricultural ecosystem, including but not limited to farmers, buyers, sellers, machinery owners, labor providers, and service seekers. FarmConnect does not act as an intermediary, broker, agent, trader, guarantor, transporter, employer, contractor, or payment processor. The Platform does not participate in, supervise, verify, execute, or enforce any transaction, agreement, payment, delivery, service, or exchange conducted between users. All interactions initiated through FarmConnect occur strictly between users, at their own discretion and risk.</p>

      <h4>2. USER ELIGIBILITY AND ACCOUNT INTEGRITY</h4>
      <p>By creating an account, you represent and warrant that you are legally capable of entering into binding agreements under applicable law and that all information provided by you is true, accurate, current, and complete. Users are solely responsible for maintaining the accuracy of their profile details, including identity information, contact numbers, location data, and listings. Fake identities, misleading profiles, impersonation, or false listings are strictly prohibited. FarmConnect reserves the absolute right to suspend, restrict, or permanently terminate any account found to contain false information, engage in deceptive behavior, or violate this Agreement, without prior notice or liability.</p>

      <h4>3. USER RESPONSIBILITIES AND PROHIBITED CONDUCT</h4>
      <p>Users agree to use the Platform only for lawful purposes and in compliance with all applicable laws and regulations. Prohibited conduct includes, but is not limited to, fraud, misrepresentation, harassment, price manipulation, uploading misleading content, posting unsafe machinery, or engaging in illegal trade or services. Any suspected or confirmed illegal activity may result in immediate account termination and disclosure of relevant information to law enforcement authorities where required by law. FarmConnect shall not be responsible for any losses, damages, or liabilities arising from user misconduct.</p>

      <h4>4. MODULE-SPECIFIC DISCLAIMERS</h4>
      <p><strong>4.1 Service Hub (Machinery & Labor Rentals):</strong> The Service Hub enables independent service providers to list agricultural machinery, equipment, or labor services. FarmConnect does not inspect, certify, verify, or guarantee the safety, legality, condition, suitability, or performance of any listed machinery or service provider. All terms, pricing, availability, operation, safety measures, damages, fuel responsibility, insurance, and payments are determined solely between users. Any accidents, injuries, equipment damage, delays, or disputes are the exclusive responsibility of the involved parties.</p>
      <p><strong>4.2 Business Zone (Bulk Harvest Marketplace):</strong> The Business Zone enables farmers and sellers to list bulk agricultural produce and allows buyers to contact them directly. FarmConnect does not verify crop quality, grading, quantity, storage conditions, transport, pricing, or buyer credibility. The Platform does not handle payments, logistics, or contractual enforcement. All negotiations, agreements, and financial exchanges occur outside the Platform and are undertaken entirely at the users’ own risk.</p>
      <p><strong>4.3 Farm Fresh (Retail Listings):</strong> Farm Fresh provides visibility for daily agricultural goods such as milk, vegetables, eggs, and related produce. FarmConnect does not guarantee freshness, hygiene, pricing accuracy, delivery timelines, or regulatory compliance of listed items. Users are solely responsible for verifying products before purchase and for resolving any disputes independently.</p>
      <p><strong>4.4 Agri-Insights, Crop Expenditure & Weather Tools:</strong> Agri-Insights, market rates, farming guides, crop expenditure tools, and weather data are provided for informational purposes only. Information may be sourced from third-party providers, public datasets, or external platforms and may not be accurate, complete, or real-time. FarmConnect makes no warranties regarding the correctness or usefulness of such data and shall not be liable for crop loss, financial loss, or decision outcomes based on reliance on informational content.</p>

      <h4>5. TRANSACTIONS, PAYMENTS, AND COMMUNICATION</h4>
      <p>FarmConnect does not facilitate payments, escrow services, refunds, guarantees, or deliveries. All payments, handovers, and service execution occur independently between users via external methods such as cash, bank transfer, or third-party payment applications. Users communicate directly through phone calls, messaging platforms (including WhatsApp), or other external channels. FarmConnect does not record, monitor, or control these communications and disclaims all liability arising from them.</p>

      <h4>6. ASSUMPTION OF RISK AND DISCLAIMER OF LIABILITY</h4>
      <p>Users expressly acknowledge and agree that they use FarmConnect at their own risk. FarmConnect, its developers, owners, affiliates, and technical partners shall not be liable for any direct, indirect, incidental, consequential, financial, physical, or reputational damages arising from: Transactions or interactions between users; Payment disputes or fraud; Crop loss, service failure, or equipment damage; Accidents, injuries, or third-party actions; Data inaccuracies or platform downtime. The Platform is provided “AS IS” and “AS AVAILABLE”, without warranties of any kind.</p>

      <h4>7. TECHNICAL PERMISSIONS AND DATA USAGE (PRIVACY POLICY)</h4>
      <p>FarmConnect collects and processes information necessary for platform functionality. This includes personal data such as name, phone number, location, photos, listings, and usage data. Location access is required to enable proximity-based discovery within a 50km radius. Camera and storage permissions are used solely for uploading profile and listing images. Phone and messaging permissions facilitate direct user communication. FarmConnect does not sell user data. Information may be shared only with service providers for operational purposes, legal compliance, fraud prevention, or system security. While reasonable security measures are implemented, no system is completely secure. Users acknowledge and accept inherent risks associated with digital data transmission.</p>

      <h4>8. DATA RETENTION AND ACCOUNT TERMINATION</h4>
      <p>User data is retained only as necessary for platform operation, legal compliance, dispute resolution, and fraud prevention. FarmConnect reserves the right to retain certain records after account termination where legally required. Accounts may be suspended or terminated at FarmConnect’s sole discretion for violation of this Agreement, without compensation or notice.</p>

      <h4>9. GOVERNING LAW AND JURISDICTION</h4>
      <p>This Agreement shall be governed by and interpreted in accordance with the laws of India. Courts having appropriate jurisdiction shall have exclusive authority over any disputes arising from use of the Platform.</p>
    `
  },
  hi: {
    lang: "हिंदी (Hindi)",
    acceptBtn: "मैं समझता हूँ और स्वीकार करता हूँ",
    declineBtn: "अस्वीकार करें",
    content: `
      <h3>फ़ार्मकनेक्ट / फ़ार्मकैप: सेवा की शर्तें और गोपनीयता नीति</h3>
      <p><strong>प्रभावी तिथि: 2025</strong></p>

      <h4>1. प्लेटफ़ॉर्म का उद्देश्य और भूमिका</h4>
      <p>फ़ार्मकनेक्ट एक तकनीकी मंच है जिसे केवल कृषि पारिस्थितिकी तंत्र के भीतर स्वतंत्र उपयोगकर्ताओं (जैसे किसान, खरीदार, मशीनरी मालिक) के बीच खोज और संचार की सुविधा के लिए डिज़ाइन किया गया है। फ़ार्मकनेक्ट मध्यस्थ, दलाल, एजेंट, व्यापारी या भुगतान प्रोसेसर के रूप में कार्य नहीं करता है। प्लेटफ़ॉर्म उपयोगकर्ताओं के बीच किसी भी लेन-देन, समझौते, भुगतान या वितरण की निगरानी या निष्पादन नहीं करता है। फ़ार्मकनेक्ट के माध्यम से शुरू की गई सभी बातचीत सख्ती से उपयोगकर्ताओं के बीच और उनके अपने जोखिम पर होती हैं।</p>

      <h4>2. उपयोगकर्ता योग्यता और खाता अखंडता</h4>
      <p>खाता बनाकर, आप वारंटी देते हैं कि आप कानूनी रूप से बाध्यकारी समझौतों में प्रवेश करने में सक्षम हैं और आपके द्वारा दी गई सभी जानकारी सत्य और सटीक है। उपयोगकर्ता अपनी प्रोफ़ाइल विवरण (पहचान, संपर्क नंबर, स्थान) की सटीकता बनाए रखने के लिए पूरी तरह जिम्मेदार हैं। नकली पहचान, भ्रामक प्रोफ़ाइल या प्रतिरूपण सख्त वर्जित है। फ़ार्मकनेक्ट झूठी जानकारी या भ्रामक व्यवहार वाले किसी भी खाते को बिना पूर्व सूचना के स्थायी रूप से समाप्त करने का अधिकार सुरक्षित रखता है।</p>

      <h4>3. उपयोगकर्ता की जिम्मेदारियां और निषिद्ध व्यवहार</h4>
      <p>उपयोगकर्ता केवल वैध उद्देश्यों के लिए प्लेटफ़ॉर्म का उपयोग करने के लिए सहमत हैं। निषिद्ध व्यवहार में धोखाधड़ी, गलत बयानी, उत्पीड़न, मूल्य हेरफेर, भ्रामक सामग्री अपलोड करना या अवैध व्यापार शामिल है। किसी भी संदिग्ध अवैध गतिविधि के परिणामस्वरूप तत्काल खाता समाप्ति और कानून प्रवर्तन अधिकारियों को जानकारी का खुलासा हो सकता है। फ़ार्मकनेक्ट उपयोगकर्ता के कदाचार से होने वाले किसी भी नुकसान के लिए जिम्मेदार नहीं होगा।</p>

      <h4>4. मॉड्यूल-विशिष्ट अस्वीकरण</h4>
      <p><strong>4.1 सर्विस हब (मशीनरी और लेबर):</strong> फ़ार्मकनेक्ट सूचीबद्ध मशीनरी या सेवा प्रदाता की सुरक्षा, वैधता, स्थिति या प्रदर्शन का निरीक्षण या गारंटी नहीं देता है। सभी शर्तें, मूल्य निर्धारण, सुरक्षा उपाय और भुगतान केवल उपयोगकर्ताओं के बीच निर्धारित किए जाते हैं। कोई भी दुर्घटना या उपकरण क्षति पूरी तरह से शामिल पक्षों की जिम्मेदारी है।</p>
      <p><strong>4.2 बिज़नेस ज़ोन (थोक फसल बाज़ार):</strong> फ़ार्मकनेक्ट फसल की गुणवत्ता, ग्रेडिंग, मात्रा या खरीदार की विश्वसनीयता को सत्यापित नहीं करता है। प्लेटफ़ॉर्म भुगतान या रसद (लॉजिस्टिक्स) को नहीं संभालता है। सभी वित्तीय आदान-प्रदान पूरी तरह से उपयोगकर्ताओं के अपने जोखिम पर होते हैं।</p>
      <p><strong>4.3 फ़ार्म फ्रेश (खुदरा लिस्टिंग):</strong> फ़ार्मकनेक्ट सूचीबद्ध वस्तुओं (दूध, सब्जियां, आदि) की ताजगी, स्वच्छता या वितरण समयसीमा की गारंटी नहीं देता है। उपयोगकर्ता खरीद से पहले उत्पादों को सत्यापित करने के लिए पूरी तरह जिम्मेदार हैं।</p>
      <p><strong>4.4 एग्री-साइट्स और मौसम उपकरण:</strong> बाजार दरें, खेती गाइड और मौसम डेटा केवल सूचनात्मक उद्देश्यों के लिए हैं। जानकारी सटीक या वास्तविक समय की नहीं हो सकती है। इस जानकारी पर निर्भरता के आधार पर फसल या वित्तीय नुकसान के लिए फ़ार्मकनेक्ट उत्तरदायी नहीं होगा।</p>

      <h4>5. लेन-देन, भुगतान और संचार</h4>
      <p>फ़ार्मकनेक्ट भुगतान, एस्क्रो सेवाएं या रिफंड की सुविधा नहीं देता है। सभी भुगतान नकद या बैंक हस्तांतरण जैसे बाहरी तरीकों से स्वतंत्र रूप से होते हैं। उपयोगकर्ता फोन कॉल या व्हाट्सएप के माध्यम से सीधे संवाद करते हैं। फ़ार्मकनेक्ट इन संचारों को रिकॉर्ड या नियंत्रित नहीं करता है।</p>

      <h4>6. जोखिम की स्वीकृति और दायित्व का अस्वीकरण</h4>
      <p>उपयोगकर्ता स्पष्ट रूप से स्वीकार करते हैं कि वे अपने जोखिम पर फ़ार्मकनेक्ट का उपयोग करते हैं। फ़ार्मकनेक्ट और उसके डेवलपर्स इसके लिए उत्तरदायी नहीं होंगे: उपयोगकर्ताओं के बीच लेन-देन; भुगतान विवाद या धोखाधड़ी; फसल का नुकसान; दुर्घटनाएं या चोटें; या डेटा अशुद्धियाँ। प्लेटफ़ॉर्म "जैसा है" (AS IS) आधार पर प्रदान किया जाता है।</p>

      <h4>7. तकनीकी अनुमतियाँ और डेटा उपयोग (गोपनीयता नीति)</h4>
      <p>फ़ार्मकनेक्ट कार्यक्षमता के लिए आवश्यक डेटा एकत्र करता है (नाम, फोन, स्थान, फोटो)। 50 किमी के दायरे में खोज को सक्षम करने के लिए स्थान (Location) का उपयोग आवश्यक है। कैमरा और स्टोरेज का उपयोग केवल फोटो अपलोड करने के लिए किया जाता है। फ़ार्मकनेक्ट उपयोगकर्ता डेटा नहीं बेचता है। कोई भी सिस्टम पूरी तरह से सुरक्षित नहीं है, और उपयोगकर्ता डिजिटल डेटा ट्रांसमिशन से जुड़े जोखिमों को स्वीकार करते हैं।</p>

      <h4>8. डेटा प्रतिधारण और खाता समाप्ति</h4>
      <p>उपयोगकर्ता डेटा केवल संचालन और कानूनी अनुपालन के लिए आवश्यक होने तक ही रखा जाता है। इस समझौते के उल्लंघन के लिए फ़ार्मकनेक्ट के विवेक पर खातों को निलंबित या समाप्त किया जा सकता है।</p>

      <h4>9. शासी कानून और अधिकार क्षेत्र</h4>
      <p>यह समझौता भारत के कानूनों के अनुसार शासित होगा। प्लेटफ़ॉर्म के उपयोग से उत्पन्न होने वाले किसी भी विवाद पर उपयुक्त अधिकार क्षेत्र वाली अदालतों का विशेष अधिकार होगा।</p>
    `
  },
  te: {
    lang: "తెలుగు (Telugu)",
    acceptBtn: "నేను అంగీకరిస్తున్నాను",
    declineBtn: "తిరస్కరించండి",
    content: `
      <h3>ఫార్మ్‌కనెక్ట్ / ఫార్మ్‌క్యాప్: సేవా నిబంధనలు & గోప్యతా విధానం</h3>
      <p><strong>తేదీ: 2025</strong></p>

      <h4>1. ప్లాట్‌ఫారమ్ ఉద్దేశ్యం మరియు పాత్ర</h4>
      <p>ఫార్మ్‌కనెక్ట్ అనేది రైతులు, కొనుగోలుదారులు, యంత్రాల యజమానులు మరియు కూలీల మధ్య కమ్యూనికేషన్‌ను సులభతరం చేయడానికి రూపొందించబడిన సాంకేతిక వేదిక మాత్రమే. ఫార్మ్‌కనెక్ట్ మధ్యవర్తి, బ్రోకర్, ఏజెంట్ లేదా చెల్లింపుదారుగా వ్యవహరించదు. వినియోగదారుల మధ్య జరిగే లావాదేవీలు, ఒప్పందాలు లేదా చెల్లింపులలో ప్లాట్‌ఫారమ్ పాల్గొనదు. ఫార్మ్‌కనెక్ట్ ద్వారా జరిగే అన్ని చర్చలు వినియోగదారుల మధ్య మరియు వారి స్వంత రిస్క్‌తో మాత్రమే జరుగుతాయి.</p>

      <h4>2. ఖాతా అర్హత మరియు నిజాయితీ</h4>
      <p>ఖాతాను సృష్టించడం ద్వారా, మీరు అందించిన సమాచారం (పేరు, ఫోన్, చిరునామా) పూర్తిగా నిజమని మీరు అంగీకరిస్తున్నారు. నకిలీ గుర్తింపులు, తప్పుదోవ పట్టించే ప్రొఫైల్‌లు లేదా ఇతరుల పేరుతో ఖాతాలు తెరవకూడదు. తప్పుడు సమాచారం ఉన్న ఖాతాలను ఎటువంటి నోటీసు లేకుండా శాశ్వతంగా తొలగించే హక్కు ఫార్మ్‌కనెక్ట్‌కు ఉంది.</p>

      <h4>3. వినియోగదారు బాధ్యతలు మరియు నిషిద్ధ చర్యలు</h4>
      <p>మోసం, వేధింపులు, తప్పుడు ధరలు, ప్రమాదకరమైన యంత్రాలను పోస్ట్ చేయడం లేదా చట్టవిరుద్ధ కార్యకలాపాలకు పాల్పడటం పూర్తిగా నిషేధించబడింది. అనుమానాస్పద చర్యలు కనిపిస్తే, ఖాతా తొలగించబడుతుంది మరియు చట్టపరమైన అధికారులకు సమాచారం ఇవ్వబడుతుంది.</p>

      <h4>4. మాడ్యూల్ వారీగా నిరాకరణలు (Disclaimers)</h4>
      <p><strong>4.1 సర్వీస్ హబ్ (యంత్రాలు & లేబర్):</strong> లిస్ట్ చేయబడిన యంత్రాలు లేదా కూలీల భద్రత మరియు పనితీరుకు ఫార్మ్‌కనెక్ట్ గ్యారెంటీ ఇవ్వదు. ధరలు, భద్రత మరియు ప్రమాదాలకు సంబంధించిన అన్ని బాధ్యతలు పూర్తిగా వినియోగదారులవే.</p>
      <p><strong>4.2 బిజినెస్ జోన్ (పంట అమ్మకాలు):</strong> పంట నాణ్యత, గ్రేడింగ్ లేదా కొనుగోలుదారుడి విశ్వసనీయతను మేము తనిఖీ చేయము. చెల్లింపులు మరియు రవాణా మా బాధ్యత కాదు. అన్ని ఆర్థిక లావాదేవీలు మీ స్వంత రిస్క్‌తో జరగాలి.</p>
      <p><strong>4.3 ఫార్మ్ ఫ్రెష్ (రిటైల్):</strong> పాలు, కూరగాయలు వంటి వస్తువుల తాజాదనం లేదా నాణ్యతకు ఫార్మ్‌కనెక్ట్ బాధ్యత వహించదు. కొనుగోలు చేయడానికి ముందు వస్తువులను మీరే తనిఖీ చేసుకోవాలి.</p>
      <p><strong>4.4 సమాచారం & వాతావరణం:</strong> మార్కెట్ ధరలు మరియు వాతావరణ సమాచారం కేవలం అవగాహన కోసం మాత్రమే. ఇది ఖచ్చితంగా ఉండకపోవచ్చు. ఈ సమాచారం ఆధారంగా జరిగే పంట నష్టానికి లేదా ఆర్థిక నష్టానికి మేము బాధ్యులం కాదు.</p>

      <h4>5. లావాదేవీలు మరియు చెల్లింపులు</h4>
      <p>ఫార్మ్‌కనెక్ట్ చెల్లింపులను (Payments) నిర్వహించదు. అన్ని లావాదేవీలు నేరుగా వినియోగదారుల మధ్య నగదు లేదా బ్యాంక్ బదిలీ ద్వారా జరుగుతాయి. మీ ఫోన్ కాల్స్ లేదా మెసేజ్‌లను మేము రికార్డ్ చేయము లేదా నియంత్రించము.</p>

      <h4>6. రిస్క్ మరియు బాధ్యత నిరాకరణ</h4>
      <p>మీరు మీ స్వంత రిస్క్‌తో ఫార్మ్‌కనెక్ట్‌ని ఉపయోగిస్తున్నారని అంగీకరిస్తున్నారు. వినియోగదారుల మధ్య గొడవలు, పేమెంట్ మోసాలు, పంట నష్టం, ప్రమాదాలు లేదా డేటా లోపాలకు ఫార్మ్‌కనెక్ట్ మరియు దాని డెవలపర్లు బాధ్యత వహించరు.</p>

      <h4>7. టెక్నికల్ పర్మిషన్లు & డేటా (గోప్యతా విధానం)</h4>
      <p>యాప్ పని చేయడానికి అవసరమైన సమాచారాన్ని (పేరు, ఫోన్, లొకేషన్) మేము తీసుకుంటాము. మీ చుట్టూ 50 కి.మీ పరిధిలో సేవలను చూపించడానికి లొకేషన్ పర్మిషన్ అవసరం. ఫార్మ్‌కనెక్ట్ మీ డేటాను అమ్మదు. డిజిటల్ డేటా భద్రతకు సంబంధించిన రిస్క్‌లను వినియోగదారులు అర్థం చేసుకోవాలి.</p>

      <h4>8. ఖాతా తొలగింపు</h4>
      <p>నిబంధనలను ఉల్లంఘిస్తే, ఎటువంటి పరిహారం లేకుండా ఖాతాను తొలగించే అధికారం ఫార్మ్‌కనెక్ట్‌కు ఉంది.</p>

      <h4>9. న్యాయ పరిధి</h4>
      <p>ఈ ఒప్పందం భారతీయ చట్టాలకు లోబడి ఉంటుంది. ఏవైనా వివాదాలు ఉంటే వాటికి సంబంధిత కోర్టులు మాత్రమే అధికారం కలిగి ఉంటాయి.</p>
    `
  },
  ta: {
    lang: "தமிழ் (Tamil)",
    acceptBtn: "நான் ஏற்றுக்கொள்கிறேன்",
    declineBtn: "நிராகரி",
    content: `
      <h3>சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கை</h3>
      <p><strong>தேதி: 2025</strong></p>

      <h4>1. தளத்தின் நோக்கம்</h4>
      <p>FarmConnect என்பது விவசாயிகள், வாங்குபவர்கள் மற்றும் இயந்திர உரிமையாளர்களுக்கு இடையே தகவல் பரிமாற்றத்தை எளிதாக்க வடிவமைக்கப்பட்ட ஒரு தொழில்நுட்ப தளம் மட்டுமே. நாங்கள் இடைத்தரகராகவோ அல்லது பணம் வசூலிப்பவராகவோ செயல்படவில்லை. பயனர்களுக்கு இடையிலான எந்தவொரு பரிவர்த்தனை அல்லது ஒப்பந்தத்திற்கும் நாங்கள் பொறுப்பல்ல.</p>

      <h4>2. கணக்கு நேர்மை</h4>
      <p>உங்கள் பெயர், எண் மற்றும் இருப்பிடம் அனைத்தும் உண்மையானவை என்று உறுதி கூறுகிறீர்கள். போலி அடையாளங்கள் அல்லது தவறான தகவல்களைப் பயன்படுத்துவது தடைசெய்யப்பட்டுள்ளது. மீறினால் கணக்கு முடக்கப்படும்.</p>

      <h4>3. தடைசெய்யப்பட்ட நடவடிக்கைகள்</h4>
      <p>மோசடி, தவறான விலை நிர்ணயம் அல்லது ஆபத்தான இயந்திரங்களைப் பதிவேற்றுவது சட்டவிரோதமானது. சந்தேகத்திற்குரிய நடவடிக்கைகள் இருந்தால், சட்டப்படி நடவடிக்கை எடுக்கப்படும்.</p>

      <h4>4. பொறுப்புத்துறப்பு (Disclaimers)</h4>
      <p><strong>4.1 இயந்திரங்கள் & தொழிலாளர்கள்:</strong> பட்டியலிடப்பட்ட இயந்திரங்களின் பாதுகாப்பு அல்லது செயல்திறனுக்கு நாங்கள் உத்தரவாதம் அளிக்கவில்லை. விபத்துக்கள் அல்லது சேதங்களுக்கு சம்பந்தப்பட்டவர்களே பொறுப்பு.</p>
      <p><strong>4.2 பயிர் விற்பனை:</strong> பயிரின் தரம் அல்லது வாங்குபவரின் நம்பகத்தன்மையை நாங்கள் சரிபார்ப்பதில்லை. பணப் பரிமாற்றங்கள் அனைத்தும் உங்கள் சொந்தப் பொறுப்பில் நடக்க வேண்டும்.</p>
      <p><strong>4.3 Farm Fresh:</strong> பொருட்களின் தரம் மற்றும் எடையைச் சரிபார்ப்பது வாங்குபவரின் பொறுப்பு.</p>
      <p><strong>4.4 வானிலை & தகவல்:</strong> சந்தை விலைகள் மற்றும் வானிலைத் தகவல்கள் மாறுபடலாம். இவற்றை அடிப்படையாகக் கொண்டு ஏற்படும் நஷ்டங்களுக்கு நாங்கள் பொறுப்பல்ல.</p>

      <h4>5. பணம் செலுத்துதல்</h4>
      <p>நாங்கள் பணப் பரிவர்த்தனைகளைக் கையாள்வதில்லை. பயனர்கள் தங்களுக்குள் நேரடியாகப் பணத்தைப் பரிமாறிக்கொள்ள வேண்டும்.</p>

      <h4>6. ஆபத்து மற்றும் பொறுப்பு</h4>
      <p>மோசடிகள், விபத்துகள் அல்லது பண இழப்புகளுக்கு FarmConnect மற்றும் அதன் உரிமையாளர்கள் பொறுப்பேற்க மாட்டார்கள்.</p>

      <h4>7. தனியுரிமைக் கொள்கை</h4>
      <p>சேவைகளை வழங்க உங்கள் இருப்பிடம் மற்றும் தொடர்பு விவரங்களைச் சேகரிக்கிறோம். உங்கள் தரவை நாங்கள் விற்பனை செய்வதில்லை.</p>

      <h4>8. கணக்கு நீக்கம்</h4>
      <p>விதிமுறைகளை மீறினால், முன்னறிவிப்பின்றி கணக்கை நீக்க எங்களுக்கு உரிமை உண்டு.</p>

      <h4>9. சட்டம்</h4>
      <p>இந்த ஒப்பந்தம் இந்தியச் சட்டங்களுக்கு உட்பட்டது.</p>
    `
  },
  kn: {
    lang: "ಕನ್ನಡ (Kannada)",
    acceptBtn: "ನಾನು ಒಪ್ಪುತ್ತೇನೆ",
    declineBtn: "ತಿರಸ್ಕರಿಸಿ",
    content: `
      <h3>ಸೇವಾ ನಿಯಮಗಳು ಮತ್ತು ಗೌಪ್ಯತೆ ನೀತಿ</h3>
      <p><strong>ದಿನಾಂಕ: 2025</strong></p>

      <h4>1. ವೇದಿಕೆಯ ಉದ್ದೇಶ</h4>
      <p>FarmConnect ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರ ನಡುವೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸುವ ತಂತ್ರಜ್ಞಾನ ವೇದಿಕೆಯಾಗಿದೆ. ನಾವು ಮಧ್ಯವರ್ತಿಗಳಲ್ಲ. ಬಳಕೆದಾರರ ನಡುವಿನ ಯಾವುದೇ ವ್ಯವಹಾರಕ್ಕೆ ನಾವು ಜವಾಬ್ದಾರರಲ್ಲ.</p>

      <h4>2. ಖಾತೆ ಸತ್ಯಾಸತ್ಯತೆ</h4>
      <p>ನೀವು ನೀಡುವ ಎಲ್ಲಾ ಮಾಹಿತಿಯು (ಹೆಸರು, ಫೋನ್) ಸತ್ಯವಾಗಿರಬೇಕು. ನಕಲಿ ಖಾತೆಗಳನ್ನು ನಿಷೇಧಿಸಲಾಗಿದೆ. ತಪ್ಪು ಮಾಹಿತಿ ಕಂಡುಬಂದರೆ ಖಾತೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದು.</p>

      <h4>3. ನಿಷೇಧಿತ ನಡವಳಿಕೆ</h4>
      <p>ವಂಚನೆ, ತಪ್ಪು ಮಾಹಿತಿ ಅಥವಾ ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳನ್ನು ಅನುಮತಿಸುವುದಿಲ್ಲ. ಅಂತಹ ಚಟುವಟಿಕೆಗಳಿಗೆ ಕಾನೂನು ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗುವುದು.</p>

      <h4>4. ಹಕ್ಕುತ್ಯಾಗಗಳು (Disclaimers)</h4>
      <p><strong>4.1 ಸೇವಾ ಕೇಂದ್ರ:</strong> ಯಂತ್ರಗಳ ಸುರಕ್ಷತೆ ಅಥವಾ ಕಾರ್ಯಕ್ಷಮತೆಗೆ ನಾವು ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ. ಯಾವುದೇ ಅಪಘಾತಗಳಿಗೆ ಬಳಕೆದಾರರೇ ಜವಾಬ್ದಾರರು.</p>
      <p><strong>4.2 ವ್ಯಾಪಾರ ವಲಯ:</strong> ಬೆಳೆ ಗುಣಮಟ್ಟ ಅಥವಾ ಪಾವತಿಗಳಿಗೆ ನಾವು ಜವಾಬ್ದಾರರಲ್ಲ. ಎಲ್ಲಾ ವ್ಯವಹಾರಗಳು ನಿಮ್ಮ ಸ್ವಂತ ಅಪಾಯದಲ್ಲಿ ನಡೆಯಬೇಕು.</p>
      <p><strong>4.3 Farm Fresh:</strong> ವಸ್ತುಗಳ ಗುಣಮಟ್ಟವನ್ನು ಖರೀದಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ. ತಾಜಾತನಕ್ಕೆ ನಾವು ಜವಾಬ್ದಾರರಲ್ಲ.</p>
      <p><strong>4.4 ಮಾಹಿತಿ:</strong> ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ಹವಾಮಾನ ವರದಿಗಳು ಬದಲಾಗಬಹುದು. ಇದರ ಆಧಾರದ ಮೇಲೆ ಉಂಟಾಗುವ ನಷ್ಟಕ್ಕೆ ನಾವು ಹೊಣೆಯಲ್ಲ.</p>

      <h4>5. ಪಾವತಿಗಳು</h4>
      <p>ನಾವು ಪಾವತಿಗಳನ್ನು ನಿರ್ವಹಿಸುವುದಿಲ್ಲ. ಎಲ್ಲಾ ಹಣಕಾಸಿನ ವ್ಯವಹಾರಗಳು ಬಳಕೆದಾರರ ನಡುವೆ ನೇರವಾಗಿ ನಡೆಯಬೇಕು.</p>

      <h4>6. ಅಪಾಯ ಮತ್ತು ಜವಾಬ್ದಾರಿ</h4>
      <p>ಅಪ್ಲಿಕೇಶನ್ ಬಳಸುವಾಗ ಉಂಟಾಗುವ ಯಾವುದೇ ಆರ್ಥಿಕ ನಷ್ಟ, ಅಪಘಾತ ಅಥವಾ ವಂಚನೆಗೆ FarmConnect ಮಾಲೀಕರು ಜವಾಬ್ದಾರರಲ್ಲ.</p>

      <h4>7. ಗೌಪ್ಯತೆ ನೀತಿ</h4>
      <p>ಸೇವೆಗಾಗಿ ನಾವು ನಿಮ್ಮ ಸ್ಥಳ (Location) ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸುತ್ತೇವೆ. ನಿಮ್ಮ ಡೇಟಾವನ್ನು ನಾವು ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ.</p>

      <h4>8. ಖಾತೆ ರದ್ದತಿ</h4>
      <p>ನಿಯಮಗಳನ್ನು ಉಲ್ಲಂಘಿಸಿದರೆ ಖಾತೆಯನ್ನು ಅಮಾನತುಗೊಳಿಸುವ ಹಕ್ಕು ನಮಗಿದೆ.</p>

      <h4>9. ಕಾನೂನು</h4>
      <p>ಈ ಒಪ್ಪಂದವು ಭಾರತೀಯ ಕಾನೂನುಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ.</p>
    `
  },
  ml: {
    lang: "മലയാളം (Malayalam)",
    acceptBtn: "ഞാൻ അംഗീകരിക്കുന്നു",
    declineBtn: "നിരസിക്കുക",
    content: `
      <h3>സേവന നിബന്ധനകളും സ്വകാര്യതാ നയവും</h3>
      <p><strong>തീയതി: 2025</strong></p>

      <h4>1. പ്ലാറ്റ്‌ഫോം ഉദ്ദേശ്യം</h4>
      <p>കർഷകർക്കും വാങ്ങുന്നവർക്കും ഇടയിൽ ആശയവിനിമയം സുഗമമാക്കുന്നതിനുള്ള ഒരു സാങ്കേതിക പ്ലാറ്റ്‌ഫോം മാത്രമാണ് FarmConnect. ഞങ്ങൾ ഇടനിലക്കാരല്ല. ഉപയോക്താക്കൾ തമ്മിലുള്ള ഇടപാടുകൾക്ക് ഞങ്ങൾ ഉത്തരവാദികളല്ല.</p>

      <h4>2. അക്കൗണ്ട് സത്യസന്ധത</h4>
      <p>നൽകുന്ന വിവരങ്ങൾ (പേര്, ഫോൺ) കൃത്യമായിരിക്കണം. വ്യാജ അക്കൗണ്ടുകൾ അനുവദിക്കില്ല. തെറ്റായ വിവരങ്ങൾ കണ്ടെത്തിയാൽ അക്കൗണ്ട് നീക്കം ചെയ്യും.</p>

      <h4>3. നിരോധിത പ്രവർത്തനങ്ങൾ</h4>
      <p>വഞ്ചന, തെറ്റായ വിവരങ്ങൾ നൽകൽ, നിയമവിരുദ്ധ പ്രവർത്തനങ്ങൾ എന്നിവ കർശനമായി നിരോധിച്ചിരിക്കുന്നു. ഇത്തരക്കാർക്കെതിരെ നിയമനടപടി സ്വീകരിക്കും.</p>

      <h4>4. നിരാകരണങ്ങൾ (Disclaimers)</h4>
      <p><strong>4.1 മെഷിനറി & ലേബർ:</strong> യന്ത്രങ്ങളുടെ സുരക്ഷയ്ക്കോ പ്രവർത്തനത്തിനോ ഞങ്ങൾ ഗ്യാരണ്ടി നൽകുന്നില്ല. അപകടങ്ങൾക്ക് ഉപയോക്താക്കൾ മാത്രമാണ് ഉത്തരവാദികൾ.</p>
      <p><strong>4.2 ബിസിനസ് സോൺ:</strong> വിളകളുടെ ഗുണനിലവാരത്തിനോ പണമിടപാടുകൾക്കോ ഞങ്ങൾ ഉത്തരവാദികളല്ല.</p>
      <p><strong>4.3 Farm Fresh:</strong> ഉൽപ്പന്നങ്ങളുടെ ഗുണനിലവാരം വാങ്ങുന്നതിന് മുമ്പ് പരിശോധിക്കുക.</p>
      <p><strong>4.4 വിവരങ്ങൾ:</strong> വിപണി വിലകളും കാലാവസ്ഥാ വിവരങ്ങളും മാറാം. ഇതിനെ അടിസ്ഥാനമാക്കിയുള്ള നഷ്ടങ്ങൾക്ക് ഞങ്ങൾ ഉത്തരവാദികളല്ല.</p>

      <h4>5. പേയ്‌മെന്റുകൾ</h4>
      <p>ആപ്പ് വഴി പണമിടപാടുകൾ നടക്കുന്നില്ല. എല്ലാ ഇടപാടുകളും ഉപയോക്താക്കൾ നേരിട്ട് നടത്തണം.</p>

      <h4>6. ബാധ്യത</h4>
      <p>തട്ടിപ്പുകൾക്കോ പണനഷ്ടത്തിനോ FarmConnect ഉത്തരവാദികളല്ല.</p>

      <h4>7. സ്വകാര്യതാ നയം</h4>
      <p>സേവനങ്ങൾക്കായി ഞങ്ങൾ ലൊക്കേഷനും ഫോൺ നമ്പറും ശേഖരിക്കുന്നു. നിങ്ങളുടെ വിവരങ്ങൾ ഞങ്ങൾ വിൽക്കില്ല.</p>

      <h4>8. അക്കൗണ്ട് അവസാനിപ്പിക്കൽ</h4>
      <p>നിയമ ലംഘനം നടത്തിയാൽ മുന്നറിയിപ്പില്ലാതെ അക്കൗണ്ട് നീക്കം ചെയ്യും.</p>

      <h4>9. നിയമം</h4>
      <p>ഈ കരാർ ഇന്ത്യൻ നിയമങ്ങൾക്ക് വിധേയമാണ്.</p>
    `
  },
  mr: {
    lang: "मराठी (Marathi)",
    acceptBtn: "मला मान्य आहे",
    declineBtn: "नकार द्या",
    content: `
      <h3>सेवा अटी आणि गोपनीयता धोरण</h3>
      <p><strong>तारीख: 2025</strong></p>

      <h4>1. प्लॅटफॉर्मचा उद्देश</h4>
      <p>FarmConnect हे फक्त शेतकरी आणि खरेदीदार यांच्यात संपर्क साधण्यासाठी एक तंत्रज्ञान प्लॅटफॉर्म आहे. आम्ही मध्यस्थ किंवा दलाल नाही. वापरकर्त्यांमधील व्यवहारांसाठी आम्ही जबाबदार नाही.</p>

      <h4>2. खात्याची सत्यता</h4>
      <p>तुम्ही दिलेली माहिती (नाव, फोन) खरी असावी. बनावट खाती चालवण्यास मनाई आहे. चुकीची माहिती आढळल्यास खाते बंद केले जाईल.</p>

      <h4>3. प्रतिबंधित वर्तन</h4>
      <p>फसवणूक, चुकीची माहिती किंवा बेकायदेशीर व्यापार करण्यास सक्त मनाई आहे. अशा कृतींसाठी कायदेशीर कारवाई केली जाईल.</p>

      <h4>4. अस्वीकरण (Disclaimers)</h4>
      <p><strong>4.1 सर्व्हिस हब:</strong> मशीनरीची सुरक्षा किंवा कामगारांच्या वर्तनासाठी आम्ही जबाबदार नाही. अपघात झाल्यास वापरकर्ते जबाबदार असतील.</p>
      <p><strong>4.2 बिझनेस झोन:</strong> पिकाची गुणवत्ता किंवा पेमेंटसाठी आम्ही जबाबदार नाही. सर्व व्यवहार तुमच्या स्वतःच्या जोखमीवर करावेत.</p>
      <p><strong>4.3 Farm Fresh:</strong> वस्तूंची गुणवत्ता खरेदी करण्यापूर्वी तपासा.</p>
      <p><strong>4.4 माहिती:</strong> बाजारभाव आणि हवामान माहिती बदलू शकते. यावर आधारित नुकसानीसाठी आम्ही जबाबदार नाही.</p>

      <h4>5. पेमेंट</h4>
      <p>आम्ही पेमेंट प्रोसेस करत नाही. सर्व व्यवहार वापरकर्त्यांनी थेट एकमेकांशी करावेत.</p>

      <h4>6. जबाबदारी</h4>
      <p>फसवणूक, अपघात किंवा आर्थिक नुकसानीसाठी FarmConnect जबाबदार राहणार नाही.</p>

      <h4>7. गोपनीयता धोरण</h4>
      <p>सेवेसाठी आम्ही तुमचे लोकेशन आणि फोन नंबर वापरतो. आम्ही तुमचा डेटा विकत नाही.</p>

      <h4>8. खाते रद्दीकरण</h4>
      <p>नियम मोडल्यास खाते तात्काळ बंद करण्याचा अधिकार आम्हाला आहे.</p>

      <h4>9. कायदा</h4>
      <p>हा करार भारतीय कायद्यानुसार चालवला जाईल.</p>
    `
  },
  gu: {
    lang: "ગુજરાતી (Gujarati)",
    acceptBtn: "હું સ્વીકારું છું",
    declineBtn: "નકારો",
    content: `
      <h3>સેવાની શરતો અને ગોપનીયતા નીતિ</h3>
      <p><strong>તારીખ: 2025</strong></p>

      <h4>1. પ્લેટફોર્મનો હેતુ</h4>
      <p>FarmConnect એ ખેડૂતો અને ખરીદદારો વચ્ચે સંપર્ક માટેનું એક ટેકનોલોજી પ્લેટફોર્મ છે. અમે મધ્યસ્થી નથી. વપરાશકર્તાઓ વચ્ચેના વ્યવહારો માટે અમે જવાબદાર નથી.</p>

      <h4>2. ખાતાની સત્યતા</h4>
      <p>તમારી માહિતી (નામ, ફોન) સાચી હોવી જોઈએ. નકલી એકાઉન્ટ્સ પર પ્રતિબંધ છે. ખોટી માહિતી આપવા પર એકાઉન્ટ બંધ કરવામાં આવશે.</p>

      <h4>3. પ્રતિબંધિત વર્તન</h4>
      <p>છેતરપિંડી અથવા ગેરકાયદેસર પ્રવૃત્તિઓ માટે કડક કાર્યવાહી કરવામાં આવશે.</p>

      <h4>4. ડિસ્ક્લેમર</h4>
      <p><strong>4.1 મશીનરી:</strong> મશીનરીની સુરક્ષા માટે અમે ગેરંટી આપતા નથી. અકસ્માત માટે વપરાશકર્તાઓ જવાબદાર છે.</p>
      <p><strong>4.2 બિઝનેસ ઝોન:</strong> પાકની ગુણવત્તા અને ચુકવણી માટે અમે જવાબદાર નથી.</p>
      <p><strong>4.3 Farm Fresh:</strong> ખરીદતા પહેલા વસ્તુઓની તપાસ કરો.</p>
      <p><strong>4.4 માહિતી:</strong> બજારના ભાવ અને હવામાન માહિતી બદલાઈ શકે છે. તેના આધારે થતા નુકસાન માટે અમે જવાબદાર નથી.</p>

      <h4>5. ચુકવણી</h4>
      <p>અમે પેમેન્ટ સંભાળતા નથી. તમામ વ્યવહારો સીધા વપરાશકર્તાઓ વચ્ચે થવા જોઈએ.</p>

      <h4>6. જવાબદારી</h4>
      <p>છેતરપિંડી અથવા આર્થિક નુકસાન માટે FarmConnect જવાબદાર નથી.</p>

      <h4>7. ગોપનીયતા નીતિ</h4>
      <p>અમે તમારું લોકેશન અને ફોન નંબર સેવાનો ઉપયોગ કરવા માટે લઈએ છીએ. તમારો ડેટા વેચવામાં આવતો નથી.</p>

      <h4>8. એકાઉન્ટ સમાપ્તિ</h4>
      <p>નિયમોના ભંગ બદલ એકાઉન્ટ બંધ કરવામાં આવશે.</p>

      <h4>9. કાયદો</h4>
      <p>આ કરાર ભારતીય કાયદા હેઠળ છે.</p>
    `
  },
  bn: {
    lang: "বাংলা (Bengali)",
    acceptBtn: "আমি গ্রহণ করছি",
    declineBtn: "প্রত্যাখ্যান করুন",
    content: `
      <h3>পরিষেবার শর্তাবলী এবং গোপনীয়তা নীতি</h3>
      <p><strong>তারিখ: 2025</strong></p>

      <h4>1. প্ল্যাটফর্মের উদ্দেশ্য</h4>
      <p>FarmConnect শুধুমাত্র কৃষক এবং ক্রেতাদের মধ্যে যোগাযোগের জন্য একটি প্রযুক্তিগত প্ল্যাটফর্ম। আমরা মধ্যস্থতাকারী নই। ব্যবহারকারীদের মধ্যে লেনদেনের জন্য আমরা দায়ী নই।</p>

      <h4>2. অ্যাকাউন্টের সততা</h4>
      <p>আপনার দেওয়া তথ্য (নাম, ফোন) সঠিক হতে হবে। ভুয়া অ্যাকাউন্ট নিষিদ্ধ। ভুল তথ্য দিলে অ্যাকাউন্ট বাতিল করা হবে।</p>

      <h4>3. নিষিদ্ধ আচরণ</h4>
      <p>প্রতারণা বা অবৈধ কার্যকলাপে জড়িত থাকলে আইনি ব্যবস্থা নেওয়া হবে।</p>

      <h4>4. দাবিত্যাগ (Disclaimers)</h4>
      <p><strong>4.1 যন্ত্রপাতি:</strong> যন্ত্রপাতির নিরাপত্তা বা দুর্ঘটনার জন্য আমরা দায়ী নই।</p>
      <p><strong>4.2 ব্যবসা জোন:</strong> ফসলের গুণমান বা পেমেন্টের জন্য আমরা দায়ী নই। লেনদেন আপনার নিজের ঝুঁকিতে করুন।</p>
      <p><strong>4.3 Farm Fresh:</strong> কেনার আগে পণ্যের গুণমান যাচাই করুন।</p>
      <p><strong>4.4 তথ্য:</strong> বাজারের দর এবং আবহাওয়ার তথ্য পরিবর্তন হতে পারে। এর ভিত্তিতে ক্ষতির জন্য আমরা দায়ী নই।</p>

      <h4>5. পেমেন্ট</h4>
      <p>আমরা টাকা লেনদেন করি না। ব্যবহারকারীদের সরাসরি লেনদেন করতে হবে।</p>

      <h4>6. দায়বদ্ধতা</h4>
      <p>প্রতারণা বা আর্থিক ক্ষতির জন্য FarmConnect দায়ী নয়।</p>

      <h4>7. গোপনীয়তা নীতি</h4>
      <p>পরিষেবার জন্য আমরা আপনার অবস্থান এবং ফোন নম্বর সংগ্রহ করি। আমরা আপনার তথ্য বিক্রি করি না।</p>

      <h4>8. অ্যাকাউন্ট বাতিল</h4>
      <p>নিয়ম লঙ্ঘন করলে অ্যাকাউন্ট বন্ধ করে দেওয়া হবে।</p>

      <h4>9. আইন</h4>
      <p>এই চুক্তি ভারতীয় আইনের অধীন।</p>
    `
  },
  pa: {
    lang: "ਪੰਜਾਬੀ (Punjabi)",
    acceptBtn: "ਮੈਨੂੰ ਮਨਜ਼ੂਰ ਹੈ",
    declineBtn: "ਰੱਦ ਕਰੋ",
    content: `
      <h3>ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ ਅਤੇ ਪਰਦੇਦਾਰੀ ਨੀਤੀ</h3>
      <p><strong>ਮਿਤੀ: 2025</strong></p>

      <h4>1. ਪਲੇਟਫਾਰਮ ਦਾ ਉਦੇਸ਼</h4>
      <p>FarmConnect ਕਿਸਾਨਾਂ ਅਤੇ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਜੋੜਨ ਲਈ ਇੱਕ ਤਕਨੀਕੀ ਪਲੇਟਫਾਰਮ ਹੈ। ਅਸੀਂ ਵਿਚੋਲੇ ਨਹੀਂ ਹਾਂ। ਵਰਤੋਂਕਾਰਾਂ ਦੇ ਲੈਣ-ਦੇਣ ਲਈ ਅਸੀਂ ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹਾਂ।</p>

      <h4>2. ਖਾਤੇ ਦੀ ਸਚਾਈ</h4>
      <p>ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ (ਨਾਮ, ਫੋਨ) ਸਹੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ। ਨਕਲੀ ਖਾਤੇ ਬਣਾਉਣ ਦੀ ਮਨਾਹੀ ਹੈ।</p>

      <h4>3. ਮਨਾਹੀ ਵਾਲੇ ਕੰਮ</h4>
      <p>ਧੋਖਾਧੜੀ ਜਾਂ ਗੈਰ-ਕਾਨੂੰਨੀ ਕੰਮਾਂ ਲਈ ਸਖਤ ਕਾਰਵਾਈ ਕੀਤੀ ਜਾਵੇਗੀ।</p>

      <h4>4. ਬੇਦਾਅਵਾ (Disclaimers)</h4>
      <p><strong>4.1 ਮਸ਼ੀਨਰੀ:</strong> ਮਸ਼ੀਨਰੀ ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਅਸੀਂ ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹਾਂ। ਹਾਦਸੇ ਲਈ ਵਰਤੋਂਕਾਰ ਖੁਦ ਜ਼ਿੰਮੇਵਾਰ ਹਨ।</p>
      <p><strong>4.2 ਵਪਾਰ ਜ਼ੋਨ:</strong> ਫਸਲ ਦੀ ਗੁਣਵੱਤਾ ਜਾਂ ਭੁਗਤਾਨ ਲਈ ਅਸੀਂ ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹਾਂ।</p>
      <p><strong>4.3 Farm Fresh:</strong> ਖਰੀਦਣ ਤੋਂ ਪਹਿਲਾਂ ਚੀਜ਼ਾਂ ਦੀ ਜਾਂਚ ਕਰੋ।</p>
      <p><strong>4.4 ਜਾਣਕਾਰੀ:</strong> ਮੰਡੀ ਦੇ ਭਾਅ ਅਤੇ ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਬਦਲ ਸਕਦੀ ਹੈ।</p>

      <h4>5. ਭੁਗਤਾਨ</h4>
      <p>ਅਸੀਂ ਪੈਸਿਆਂ ਦਾ ਲੈਣ-ਦੇਣ ਨਹੀਂ ਕਰਦੇ। ਸਾਰੇ ਲੈਣ-ਦੇਣ ਸਿੱਧੇ ਵਰਤੋਂਕਾਰਾਂ ਵਿਚਕਾਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।</p>

      <h4>6. ਜ਼ਿੰਮੇਵਾਰੀ</h4>
      <p>ਧੋਖਾਧੜੀ ਜਾਂ ਨੁਕਸਾਨ ਲਈ FarmConnect ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹੈ।</p>

      <h4>7. ਪਰਦੇਦਾਰੀ ਨੀਤੀ</h4>
      <p>ਅਸੀਂ ਤੁਹਾਡੀ ਲੋਕੇਸ਼ਨ ਅਤੇ ਫੋਨ ਨੰਬਰ ਦੀ ਵਰਤੋਂ ਸੇਵਾ ਲਈ ਕਰਦੇ ਹਾਂ। ਅਸੀਂ ਡਾਟਾ ਵੇਚਦੇ ਨਹੀਂ ਹਾਂ।</p>

      <h4>8. ਖਾਤਾ ਬੰਦ ਕਰਨਾ</h4>
      <p>ਨਿਯਮ ਤੋੜਨ 'ਤੇ ਖਾਤਾ ਬੰਦ ਕਰ ਦਿੱਤਾ ਜਾਵੇਗਾ।</p>

      <h4>9. ਕਾਨੂੰਨ</h4>
      <p>ਇਹ ਸਮਝੌਤਾ ਭਾਰਤੀ ਕਾਨੂੰਨਾਂ ਅਧੀਨ ਹੈ।</p>
    `
  }
};

// --- THE MODAL COMPONENT ---
function TermsAndConditions({ onClose, onAccept }) {
  const [selectedLang, setSelectedLang] = useState('en');

  // STYLES
  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000,
    backdropFilter: 'blur(5px)'
  };

  const modalContentStyle = {
    width: '90%', maxWidth: '700px', backgroundColor: 'white', borderRadius: '15px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', 
    height: '90vh', overflow: 'hidden', animation: 'fadeIn 0.3s ease'
  };

  const headerStyle = {
    backgroundColor: '#1B5E20', color: 'white', padding: '15px', 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid #ddd'
  };

  const selectStyle = {
    padding: '8px', borderRadius: '5px', border: 'none', fontSize: '14px', 
    color: '#333', fontWeight: 'bold', cursor: 'pointer', outline: 'none'
  };

  const bodyStyle = {
    padding: '25px', overflowY: 'auto', lineHeight: '1.6', fontSize: '14px', color: '#333',
    flex: 1, backgroundColor: '#f9f9f9', textAlign: 'left'
  };

  const footerStyle = {
    padding: '15px', borderTop: '1px solid #eee', backgroundColor: 'white',
    display: 'flex', gap: '10px'
  };

  const btnStyle = (bg) => ({
    flex: 1, padding: '12px', border: 'none', borderRadius: '8px', 
    fontWeight: 'bold', color: 'white', cursor: 'pointer', fontSize: '15px',
    background: bg, transition: '0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  });

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* HEADER WITH LANGUAGE SELECTOR */}
        <div style={headerStyle}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <span style={{fontSize:'20px'}}>⚖️</span>
            <span style={{fontWeight:'bold'}}>Terms & Conditions</span>
          </div>
          <select 
            value={selectedLang} 
            onChange={(e) => setSelectedLang(e.target.value)} 
            style={selectStyle}
          >
            {Object.keys(termsData).map((key) => (
              <option key={key} value={key}>
                {termsData[key].lang}
              </option>
            ))}
          </select>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div style={bodyStyle}>
          {/* Injecting HTML for formatting */}
          <div dangerouslySetInnerHTML={{ __html: termsData[selectedLang].content }} />
          
          <div style={{marginTop:'20px', fontSize:'12px', color:'#666', fontStyle:'italic', borderTop:'1px solid #ddd', paddingTop:'10px'}}>
            * By proceeding, you acknowledge that you have understood these terms in your preferred language or English.
          </div>
        </div>

        {/* FOOTER ACTIONS - DYNAMIC BUTTON TEXT */}
        <div style={footerStyle}>
          <button onClick={onClose} style={btnStyle('#d32f2f')}>
            {termsData[selectedLang].declineBtn}
          </button>
          <button onClick={onAccept} style={btnStyle('#2E7D32')}>
            {termsData[selectedLang].acceptBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;