// src/Data/marketData.js

export const CEDA_LIBRARY = {
  // ==========================================
  // 1. MODERN GEOGRAPHY TREE (28 States & 8 UTs)
  // ==========================================
  states: [
    // --- THE 28 STATES ---
    {
      name: "Andhra Pradesh",
      districts: [
        { name: "Alluri Sitharama Raju" }, { name: "Anakapalli" }, { name: "Annamayya" }, { name: "Bapatla" }, { name: "Chittoor" }, { name: "East Godavari" }, { name: "Eluru" }, { name: "Guntur" }, { name: "Kakinada" }, { name: "Konaseema" }, { name: "Krishna" }, { name: "Kurnool" }, { name: "Nandyal" }, { name: "NTR" }, { name: "Palnadu" }, { name: "Parvathipuram Manyam" }, { name: "Prakasam" }, { name: "SPSR Nellore" }, { name: "Sri Sathya Sai" }, { name: "Srikakulam" }, { name: "Tirupati" }, { name: "Visakhapatnam" }, { name: "Vizianagaram" }, { name: "West Godavari" }, { name: "YSR Kadapa" }
      ]
    },
    {
      name: "Arunachal Pradesh",
      districts: [
        { name: "Anjaw" }, { name: "Changlang" }, { name: "Dibang Valley" }, { name: "East Kameng" }, { name: "East Siang" }, { name: "Itanagar Capital Complex" }, { name: "Kamle" }, { name: "Kra Daadi" }, { name: "Kurung Kumey" }, { name: "Lepa Rada" }, { name: "Lohit" }, { name: "Longding" }, { name: "Lower Dibang Valley" }, { name: "Lower Siang" }, { name: "Lower Subansiri" }, { name: "Namsai" }, { name: "Pakke Kessang" }, { name: "Papum Pare" }, { name: "Shi Yomi" }, { name: "Siang" }, { name: "Tawang" }, { name: "Tirap" }, { name: "Upper Siang" }, { name: "Upper Subansiri" }, { name: "West Kameng" }, { name: "West Siang" }
      ]
    },
    {
      name: "Assam",
      districts: [
        { name: "Bajali" }, { name: "Baksa" }, { name: "Barpeta" }, { name: "Biswanath" }, { name: "Bongaigaon" }, { name: "Cachar" }, { name: "Charaideo" }, { name: "Chirang" }, { name: "Darrang" }, { name: "Dhemaji" }, { name: "Dhubri" }, { name: "Dibrugarh" }, { name: "Dima Hasao" }, { name: "Goalpara" }, { name: "Golaghat" }, { name: "Hailakandi" }, { name: "Hojai" }, { name: "Jorhat" }, { name: "Kamrup Metropolitan" }, { name: "Kamrup" }, { name: "Karbi Anglong" }, { name: "Karimganj" }, { name: "Kokrajhar" }, { name: "Lakhimpur" }, { name: "Majuli" }, { name: "Morigaon" }, { name: "Nagaon" }, { name: "Nalbari" }, { name: "Sivasagar" }, { name: "Sonitpur" }, { name: "South Salmara-Mankachar" }, { name: "Tinsukia" }, { name: "Udalguri" }, { name: "West Karbi Anglong" }
      ]
    },
    {
      name: "Bihar",
      districts: [
        { name: "Araria" }, { name: "Arwal" }, { name: "Aurangabad" }, { name: "Banka" }, { name: "Begusarai" }, { name: "Bhagalpur" }, { name: "Bhojpur" }, { name: "Buxar" }, { name: "Darbhanga" }, { name: "East Champaran" }, { name: "Gaya" }, { name: "Gopalganj" }, { name: "Jamui" }, { name: "Jehanabad" }, { name: "Kaimur" }, { name: "Katihar" }, { name: "Khagaria" }, { name: "Kishanganj" }, { name: "Lakhisarai" }, { name: "Madhepura" }, { name: "Madhubani" }, { name: "Munger" }, { name: "Muzaffarpur" }, { name: "Nalanda" }, { name: "Nawada" }, { name: "Patna" }, { name: "Purnia" }, { name: "Rohtas" }, { name: "Saharsa" }, { name: "Samastipur" }, { name: "Saran" }, { name: "Sheikhpura" }, { name: "Sheohar" }, { name: "Sitamarhi" }, { name: "Siwan" }, { name: "Supaul" }, { name: "Vaishali" }, { name: "West Champaran" }
      ]
    },
    {
      name: "Chhattisgarh",
      districts: [
        { name: "Balod" }, { name: "Baloda Bazar" }, { name: "Balrampur" }, { name: "Bastar" }, { name: "Bemetara" }, { name: "Bijapur" }, { name: "Bilaspur" }, { name: "Dantewada" }, { name: "Dhamtari" }, { name: "Durg" }, { name: "Gariaband" }, { name: "Gaurela Pendra Marwahi" }, { name: "Janjgir-Champa" }, { name: "Jashpur" }, { name: "Kabirdham" }, { name: "Kanker" }, { name: "Kondagaon" }, { name: "Khairagarh-Chhuikhadan-Gandai" }, { name: "Korba" }, { name: "Koriya" }, { name: "Mahasamund" }, { name: "Manendragarh-Chirmiri-Bharatpur" }, { name: "Mohla-Manpur-Ambagarh Chowki" }, { name: "Mungeli" }, { name: "Narayanpur" }, { name: "Raigarh" }, { name: "Raipur" }, { name: "Rajnandgaon" }, { name: "Sarangarh-Bilaigarh" }, { name: "Sakti" }, { name: "Sukma" }, { name: "Surajpur" }, { name: "Surguja" }
      ]
    },
    {
      name: "Goa",
      districts: [
        { name: "North Goa" }, { name: "South Goa" }
      ]
    },
    {
      name: "Gujarat",
      districts: [
        { name: "Ahmedabad" }, { name: "Amreli" }, { name: "Anand" }, { name: "Aravalli" }, { name: "Banaskantha" }, { name: "Bharuch" }, { name: "Bhavnagar" }, { name: "Botad" }, { name: "Chhota Udaipur" }, { name: "Dahod" }, { name: "Dang" }, { name: "Devbhoomi Dwarka" }, { name: "Gandhinagar" }, { name: "Gir Somnath" }, { name: "Jamnagar" }, { name: "Junagadh" }, { name: "Kheda" }, { name: "Kutch" }, { name: "Mahisagar" }, { name: "Mehsana" }, { name: "Morbi" }, { name: "Narmada" }, { name: "Navsari" }, { name: "Panchmahal" }, { name: "Patan" }, { name: "Porbandar" }, { name: "Rajkot" }, { name: "Sabarkantha" }, { name: "Surat" }, { name: "Surendranagar" }, { name: "Tapi" }, { name: "Vadodara" }, { name: "Valsad" }
      ]
    },
    {
      name: "Haryana",
      districts: [
        { name: "Ambala" }, { name: "Bhiwani" }, { name: "Charkhi Dadri" }, { name: "Faridabad" }, { name: "Fatehabad" }, { name: "Gurugram" }, { name: "Hisar" }, { name: "Jhajjar" }, { name: "Jind" }, { name: "Kaithal" }, { name: "Karnal" }, { name: "Kurukshetra" }, { name: "Mahendragarh" }, { name: "Nuh" }, { name: "Palwal" }, { name: "Panchkula" }, { name: "Panipat" }, { name: "Rewari" }, { name: "Rohtak" }, { name: "Sirsa" }, { name: "Sonipat" }, { name: "Yamunanagar" }
      ]
    },
    {
      name: "Himachal Pradesh",
      districts: [
        { name: "Bilaspur" }, { name: "Chamba" }, { name: "Hamirpur" }, { name: "Kangra" }, { name: "Kinnaur" }, { name: "Kullu" }, { name: "Lahaul and Spiti" }, { name: "Mandi" }, { name: "Shimla" }, { name: "Sirmaur" }, { name: "Solan" }, { name: "Una" }
      ]
    },
    {
      name: "Jharkhand",
      districts: [
        { name: "Bokaro" }, { name: "Chatra" }, { name: "Deoghar" }, { name: "Dhanbad" }, { name: "Dumka" }, { name: "East Singhbhum" }, { name: "Garhwa" }, { name: "Giridih" }, { name: "Godda" }, { name: "Gumla" }, { name: "Hazaribagh" }, { name: "Jamtara" }, { name: "Khunti" }, { name: "Koderma" }, { name: "Latehar" }, { name: "Lohardaga" }, { name: "Pakur" }, { name: "Palamu" }, { name: "Ramgarh" }, { name: "Ranchi" }, { name: "Sahibganj" }, { name: "Seraikela Kharsawan" }, { name: "Simdega" }, { name: "West Singhbhum" }
      ]
    },
    {
      name: "Karnataka",
      districts: [
        { name: "Bagalkot" }, { name: "Ballari" }, { name: "Belagavi" }, { name: "Bengaluru Rural" }, { name: "Bengaluru Urban" }, { name: "Bidar" }, { name: "Chamarajanagar" }, { name: "Chikkaballapur" }, { name: "Chikkamagaluru" }, { name: "Chitradurga" }, { name: "Dakshina Kannada" }, { name: "Davanagere" }, { name: "Dharwad" }, { name: "Gadag" }, { name: "Hassan" }, { name: "Haveri" }, { name: "Kalaburagi" }, { name: "Kodagu" }, { name: "Kolar" }, { name: "Koppal" }, { name: "Mandya" }, { name: "Mysuru" }, { name: "Raichur" }, { name: "Ramanagara" }, { name: "Shivamogga" }, { name: "Tumakuru" }, { name: "Udupi" }, { name: "Uttara Kannada" }, { name: "Vijayapura" }, { name: "Yadgir" }, { name: "Vijayanagara" }
      ]
    },
    {
      name: "Kerala",
      districts: [
        { name: "Alappuzha" }, { name: "Ernakulam" }, { name: "Idukki" }, { name: "Kannur" }, { name: "Kasaragod" }, { name: "Kollam" }, { name: "Kottayam" }, { name: "Kozhikode" }, { name: "Malappuram" }, { name: "Palakkad" }, { name: "Pathanamthitta" }, { name: "Thiruvananthapuram" }, { name: "Thrissur" }, { name: "Wayanad" }
      ]
    },
    {
      name: "Madhya Pradesh",
      districts: [
        { name: "Agar Malwa" }, { name: "Alirajpur" }, { name: "Anuppur" }, { name: "Ashoknagar" }, { name: "Balaghat" }, { name: "Barwani" }, { name: "Betul" }, { name: "Bhind" }, { name: "Bhopal" }, { name: "Burhanpur" }, { name: "Chhatarpur" }, { name: "Chhindwara" }, { name: "Damoh" }, { name: "Datia" }, { name: "Dewas" }, { name: "Dhar" }, { name: "Dindori" }, { name: "Guna" }, { name: "Gwalior" }, { name: "Harda" }, { name: "Narmadapuram" }, { name: "Indore" }, { name: "Jabalpur" }, { name: "Jhabua" }, { name: "Katni" }, { name: "Khandwa" }, { name: "Khargone" }, { name: "Mandla" }, { name: "Mandsaur" }, { name: "Morena" }, { name: "Narsinghpur" }, { name: "Neemuch" }, { name: "Niwari" }, { name: "Panna" }, { name: "Raisen" }, { name: "Rajgarh" }, { name: "Ratlam" }, { name: "Rewa" }, { name: "Sagar" }, { name: "Satna" }, { name: "Sehore" }, { name: "Seoni" }, { name: "Shahdol" }, { name: "Shajapur" }, { name: "Sheopur" }, { name: "Shivpuri" }, { name: "Sidhi" }, { name: "Singrauli" }, { name: "Tikamgarh" }, { name: "Ujjain" }, { name: "Umaria" }, { name: "Vidisha" }, { name: "Mauganj" }, { name: "Pandhurna" }, { name: "Maihar" }
      ]
    },
    {
      name: "Maharashtra",
      districts: [
        { name: "Ahmednagar" }, { name: "Akola" }, { name: "Amravati" }, { name: "Aurangabad" }, { name: "Beed" }, { name: "Bhandara" }, { name: "Buldhana" }, { name: "Chandrapur" }, { name: "Dhule" }, { name: "Gadchiroli" }, { name: "Gondia" }, { name: "Hingoli" }, { name: "Jalgaon" }, { name: "Jalna" }, { name: "Kolhapur" }, { name: "Latur" }, { name: "Mumbai City" }, { name: "Mumbai Suburban" }, { name: "Nagpur" }, { name: "Nanded" }, { name: "Nandurbar" }, { name: "Nashik" }, { name: "Osmanabad" }, { name: "Palghar" }, { name: "Parbhani" }, { name: "Pune" }, { name: "Raigad" }, { name: "Ratnagiri" }, { name: "Sangli" }, { name: "Satara" }, { name: "Sindhudurg" }, { name: "Solapur" }, { name: "Thane" }, { name: "Wardha" }, { name: "Washim" }, { name: "Yavatmal" }
      ]
    },
    {
      name: "Manipur",
      districts: [
        { name: "Bishnupur" }, { name: "Chandel" }, { name: "Churachandpur" }, { name: "Imphal East" }, { name: "Imphal West" }, { name: "Jiribam" }, { name: "Kakching" }, { name: "Kamjong" }, { name: "Kangpokpi" }, { name: "Noney" }, { name: "Pherzawl" }, { name: "Senapati" }, { name: "Tamenglong" }, { name: "Tengnoupal" }, { name: "Thoubal" }, { name: "Ukhrul" }
      ]
    },
    {
      name: "Meghalaya",
      districts: [
        { name: "East Garo Hills" }, { name: "East Jaintia Hills" }, { name: "East Khasi Hills" }, { name: "Eastern West Khasi Hills" }, { name: "North Garo Hills" }, { name: "Ri Bhoi" }, { name: "South Garo Hills" }, { name: "South West Garo Hills" }, { name: "South West Khasi Hills" }, { name: "West Garo Hills" }, { name: "West Jaintia Hills" }, { name: "West Khasi Hills" }
      ]
    },
    {
      name: "Mizoram",
      districts: [
        { name: "Aizawl" }, { name: "Champhai" }, { name: "Hnahthial" }, { name: "Khawzawl" }, { name: "Kolasib" }, { name: "Lawngtlai" }, { name: "Lunglei" }, { name: "Mamit" }, { name: "Saiha" }, { name: "Saitual" }, { name: "Serchhip" }
      ]
    },
    {
      name: "Nagaland",
      districts: [
        { name: "Chümoukedima" }, { name: "Dimapur" }, { name: "Kiphire" }, { name: "Kohima" }, { name: "Longleng" }, { name: "Mokokchung" }, { name: "Mon" }, { name: "Niuland" }, { name: "Noklak" }, { name: "Peren" }, { name: "Phek" }, { name: "Shamator" }, { name: "Tseminyu" }, { name: "Tuensang" }, { name: "Wokha" }, { name: "Zunheboto" }
      ]
    },
    {
      name: "Odisha",
      districts: [
        { name: "Angul" }, { name: "Balangir" }, { name: "Balasore" }, { name: "Bargarh" }, { name: "Bhadrak" }, { name: "Boudh" }, { name: "Cuttack" }, { name: "Deogarh" }, { name: "Dhenkanal" }, { name: "Gajapati" }, { name: "Ganjam" }, { name: "Jagatsinghpur" }, { name: "Jajpur" }, { name: "Jharsuguda" }, { name: "Kalahandi" }, { name: "Kandhamal" }, { name: "Kendrapara" }, { name: "Kendujhar" }, { name: "Khordha" }, { name: "Koraput" }, { name: "Malkangiri" }, { name: "Mayurbhanj" }, { name: "Nabarangpur" }, { name: "Nayagarh" }, { name: "Nuapada" }, { name: "Puri" }, { name: "Rayagada" }, { name: "Sambalpur" }, { name: "Subarnapur" }, { name: "Sundargarh" }
      ]
    },
    {
      name: "Punjab",
      districts: [
        { name: "Amritsar" }, { name: "Barnala" }, { name: "Bathinda" }, { name: "Faridkot" }, { name: "Fatehgarh Sahib" }, { name: "Fazilka" }, { name: "Ferozepur" }, { name: "Gurdaspur" }, { name: "Hoshiarpur" }, { name: "Jalandhar" }, { name: "Kapurthala" }, { name: "Ludhiana" }, { name: "Malerkotla" }, { name: "Mansa" }, { name: "Moga" }, { name: "Pathankot" }, { name: "Patiala" }, { name: "Rupnagar" }, { name: "Sahibzada Ajit Singh Nagar" }, { name: "Sangrur" }, { name: "Shahid Bhagat Singh Nagar" }, { name: "Sri Muktsar Sahib" }, { name: "Tarn Taran" }
      ]
    },
    {
      name: "Rajasthan",
      districts: [
        { name: "Ajmer" }, { name: "Alwar" }, { name: "Anupgarh" }, { name: "Balotra" }, { name: "Banswara" }, { name: "Baran" }, { name: "Barmer" }, { name: "Beawar" }, { name: "Bharatpur" }, { name: "Bhilwara" }, { name: "Bikaner" }, { name: "Bundi" }, { name: "Chittorgarh" }, { name: "Churu" }, { name: "Dausa" }, { name: "Deeg" }, { name: "Dholpur" }, { name: "Didwana-Kuchaman" }, { name: "Dudu" }, { name: "Dungarpur" }, { name: "Ganganagar" }, { name: "Gangapur City" }, { name: "Hanumangarh" }, { name: "Jaipur" }, { name: "Jaipur Rural" }, { name: "Jaisalmer" }, { name: "Jalore" }, { name: "Jhalawar" }, { name: "Jhunjhunu" }, { name: "Jodhpur" }, { name: "Jodhpur Rural" }, { name: "Karauli" }, { name: "Kekri" }, { name: "Khairthal-Tijara" }, { name: "Kota" }, { name: "Kotputli-Behror" }, { name: "Nagaur" }, { name: "Nenwa" }, { name: "Neem Ka Thana" }, { name: "Pali" }, { name: "Phalodi" }, { name: "Pratapgarh" }, { name: "Rajsamand" }, { name: "Salumbar" }, { name: "Sanchore" }, { name: "Sawai Madhopur" }, { name: "Shahpura" }, { name: "Sikar" }, { name: "Sirohi" }, { name: "Tonk" }, { name: "Udaipur" }
      ]
    },
    {
      name: "Sikkim",
      districts: [
        { name: "Gangtok" }, { name: "Gyalshing" }, { name: "Mangan" }, { name: "Namchi" }, { name: "Pakyong" }, { name: "Soreng" }
      ]
    },
    {
      name: "Tamil Nadu",
      districts: [
        { name: "Ariyalur" }, { name: "Chengalpattu" }, { name: "Chennai" }, { name: "Coimbatore" }, { name: "Cuddalore" }, { name: "Dharmapuri" }, { name: "Dindigul" }, { name: "Erode" }, { name: "Kallakurichi" }, { name: "Kanchipuram" }, { name: "Kanyakumari" }, { name: "Karur" }, { name: "Krishnagiri" }, { name: "Madurai" }, { name: "Mayiladuthurai" }, { name: "Nagapattinam" }, { name: "Namakkal" }, { name: "Nilgiris" }, { name: "Perambalur" }, { name: "Pudukkottai" }, { name: "Ramanathapuram" }, { name: "Ranipet" }, { name: "Salem" }, { name: "Sivaganga" }, { name: "Tenkasi" }, { name: "Thanjavur" }, { name: "Theni" }, { name: "Thoothukudi" }, { name: "Tiruchirappalli" }, { name: "Tirunelveli" }, { name: "Tirupattur" }, { name: "Tiruppur" }, { name: "Tiruvallur" }, { name: "Tiruvannamalai" }, { name: "Tiruvarur" }, { name: "Vellore" }, { name: "Viluppuram" }, { name: "Virudhunagar" }
      ]
    },
    {
      name: "Telangana",
      districts: [
        { name: "Adilabad" }, { name: "Bhadradri Kothagudem" }, { name: "Hyderabad" }, { name: "Jagtial" }, { name: "Jangaon" }, { name: "Jayashankar Bhupalpally" }, { name: "Jogulamba Gadwal" }, { name: "Kamareddy" }, { name: "Karimnagar" }, { name: "Khammam" }, { name: "Kumuram Bheem" }, { name: "Mahabubabad" }, { name: "Mahabubnagar" }, { name: "Mancherial" }, { name: "Medak" }, { name: "Medchal Malkajgiri" }, { name: "Mulugu" }, { name: "Nagarkurnool" }, { name: "Nalgonda" }, { name: "Narayanpet" }, { name: "Nirmal" }, { name: "Nizamabad" }, { name: "Peddapalli" }, { name: "Rajanna Sircilla" }, { name: "Ranga Reddy" }, { name: "Sangareddy" }, { name: "Siddipet" }, { name: "Suryapet" }, { name: "Vikarabad" }, { name: "Wanaparthy" }, { name: "Warangal" }, { name: "Hanamkonda" }, { name: "Yadadri Bhuvanagiri" }
      ]
    },
    {
      name: "Tripura",
      districts: [
        { name: "Dhalai" }, { name: "Gomati" }, { name: "Khowai" }, { name: "North Tripura" }, { name: "Sepahijala" }, { name: "South Tripura" }, { name: "Unakoti" }, { name: "West Tripura" }
      ]
    },
    {
      name: "Uttar Pradesh",
      districts: [
        { name: "Agra" }, { name: "Aligarh" }, { name: "Ambedkar Nagar" }, { name: "Amethi" }, { name: "Amroha" }, { name: "Auraiya" }, { name: "Ayodhya" }, { name: "Azamgarh" }, { name: "Badaun" }, { name: "Baghpat" }, { name: "Bahraich" }, { name: "Balarampur" }, { name: "Ballia" }, { name: "Banda" }, { name: "Barabanki" }, { name: "Bareilly" }, { name: "Basti" }, { name: "Bhadohi" }, { name: "Bijnor" }, { name: "Budaun" }, { name: "Bulandshahr" }, { name: "Chandauli" }, { name: "Chitrakoot" }, { name: "Deoria" }, { name: "Etah" }, { name: "Etawah" }, { name: "Farrukhabad" }, { name: "Fatehpur" }, { name: "Firozabad" }, { name: "Gautam Buddha Nagar" }, { name: "Ghaziabad" }, { name: "Ghazipur" }, { name: "Gonda" }, { name: "Gorakhpur" }, { name: "Hamirpur" }, { name: "Hapur" }, { name: "Hardoi" }, { name: "Hathras" }, { name: "Jalaun" }, { name: "Jaunpur" }, { name: "Jhansi" }, { name: "Kannauj" }, { name: "Kanpur Dehat" }, { name: "Kanpur Nagar" }, { name: "Kasganj" }, { name: "Kaushambi" }, { name: "Kheri" }, { name: "Kushinagar" }, { name: "Lalitpur" }, { name: "Lucknow" }, { name: "Maharajganj" }, { name: "Mahoba" }, { name: "Mainpuri" }, { name: "Mathura" }, { name: "Mau" }, { name: "Meerut" }, { name: "Mirzapur" }, { name: "Moradabad" }, { name: "Muzaffarnagar" }, { name: "Pilibhit" }, { name: "Pratapgarh" }, { name: "Prayagraj" }, { name: "Raebareli" }, { name: "Rampur" }, { name: "Saharanpur" }, { name: "Sambhal" }, { name: "Sant Kabir Nagar" }, { name: "Shahjahanpur" }, { name: "Shamli" }, { name: "Shravasti" }, { name: "Siddharthnagar" }, { name: "Sitapur" }, { name: "Sonbhadra" }, { name: "Sultanpur" }, { name: "Unnao" }, { name: "Varanasi" }
      ]
    },
    {
      name: "Uttarakhand",
      districts: [
        { name: "Almora" }, { name: "Bageshwar" }, { name: "Chamoli" }, { name: "Champawat" }, { name: "Dehradun" }, { name: "Haridwar" }, { name: "Nainital" }, { name: "Pauri Garhwal" }, { name: "Pithoragarh" }, { name: "Rudraprayag" }, { name: "Tehri Garhwal" }, { name: "Udham Singh Nagar" }, { name: "Uttarkashi" }
      ]
    },
    {
      name: "West Bengal",
      districts: [
        { name: "Alipurduar" }, { name: "Bankura" }, { name: "Birbhum" }, { name: "Cooch Behar" }, { name: "Dakshin Dinajpur" }, { name: "Darjeeling" }, { name: "Hooghly" }, { name: "Howrah" }, { name: "Jalpaiguri" }, { name: "Jhargram" }, { name: "Kalimpong" }, { name: "Kolkata" }, { name: "Malda" }, { name: "Murshidabad" }, { name: "Nadia" }, { name: "North 24 Parganas" }, { name: "Paschim Bardhaman" }, { name: "Paschim Medinipur" }, { name: "Purba Bardhaman" }, { name: "Purba Medinipur" }, { name: "Purulia" }, { name: "South 24 Parganas" }, { name: "Uttar Dinajpur" }, { name: "Basirhat" }, { name: "Bishnupur" }, { name: "Ichhamati" }, { name: "Kandi" }, { name: "Sundarban" }
      ]
    },

    // --- THE 8 UNION TERRITORIES ---
    {
      name: "Andaman and Nicobar Islands",
      districts: [
        { name: "Nicobar" }, { name: "North and Middle Andaman" }, { name: "South Andaman" }
      ]
    },
    {
      name: "Chandigarh",
      districts: [
        { name: "Chandigarh" }
      ]
    },
    {
      name: "Dadra and Nagar Haveli and Daman and Diu",
      districts: [
        { name: "Dadra and Nagar Haveli" }, { name: "Daman" }, { name: "Diu" }
      ]
    },
    {
      name: "Delhi",
      districts: [
        { name: "Central Delhi" }, { name: "East Delhi" }, { name: "New Delhi" }, { name: "North Delhi" }, { name: "North East Delhi" }, { name: "North West Delhi" }, { name: "Shahdara" }, { name: "South Delhi" }, { name: "South East Delhi" }, { name: "South West Delhi" }, { name: "West Delhi" }
      ]
    },
    {
      name: "Jammu and Kashmir",
      districts: [
        { name: "Anantnag" }, { name: "Bandipora" }, { name: "Baramulla" }, { name: "Budgam" }, { name: "Doda" }, { name: "Ganderbal" }, { name: "Jammu" }, { name: "Kathua" }, { name: "Kishtwar" }, { name: "Kulgam" }, { name: "Kupwara" }, { name: "Poonch" }, { name: "Pulwama" }, { name: "Rajouri" }, { name: "Ramban" }, { name: "Reasi" }, { name: "Samba" }, { name: "Shopian" }, { name: "Srinagar" }, { name: "Udhampur" }
      ]
    },
    {
      name: "Ladakh",
      districts: [
        { name: "Kargil" }, { name: "Leh" }
      ]
    },
    {
      name: "Lakshadweep",
      districts: [
        { name: "Lakshadweep" }
      ]
    },
    {
      name: "Puducherry",
      districts: [
        { name: "Karaikal" }, { name: "Mahe" }, { name: "Puducherry" }, { name: "Yanam" }
      ]
    }
  ],

  // ==========================================
  // 2. EXACT CROP TAXONOMY (Gov API Master List)
  // ==========================================
  commodityGroups: [
    {
      groupName: "Beverages",
      commodities: [
        "Chicory(Chikori/Kasni)", "Cocoa", "Coffee", "Green Tea", "Tea"
      ]
    },
    {
      groupName: "Cereals",
      commodities: [
        "Bajra(Pearl Millet/Cumbu)", "Barley(Jau)", "Barnyard Millet", "Beaten Rice", "Browntop Millet", "Chakhao(Black Rice)", "Foxtail Millet(Navane)", "Hybrid Cumbu", "Jaee", "Jowar(Sorghum)", "Kodo Millet(Varagu)", "Kutki", "Little Millet", "Maize", "Paddy(Basmati)", "Paddy(Common)", "Proso Millet", "Ragi(Finger Millet)", "Rala", "Rice", "Sajje", "Same/Savi", "Soji", "Sweet Corn", "T.V. Cumbu", "Wheat"
      ]
    },
    {
      groupName: "Drug and Narcotics",
      commodities: [
        "Arecanut(Betelnut/Supari)", "Asalia", "Ashoka", "Ashwagandha", "Asparagus", "Atis", "Betal Leaves", "Chandrashoor", "Coleus", "Isabgul(Psyllium)", "Isbgol", "Lemongrass", "MENETC*3", "Mahua", "Mentha Oil", "Muesli", "Muleti", "Myrobolan(Harad)", "Neem Fruits", "Palash flowers", "Poppy capsules", "Pupadia", "Swan Plant (Green Herb)", "Tendu Leaves/Kendu leaves/Bidi Leaves", "Tobacco", "Vatsanabha", "White Muesli", "basil", "dhawai flowers", "karanja seeds", "kutki", "liquor turmeric", "macoy", "nigella seeds", "pippali", "sanay", "stevia", "stone pulverizer", "vadang"
      ]
    },
    {
      groupName: "Dry Fruits",
      commodities: [
        "Almond(Badam)", "Cashewnuts", "Dates", "Dry Grapes", "Fig (Dry)", "Makhana(Foxnut)", "Pine Nut(Chilgoza /Niyoza)", "Pista(Pistachio)", "Walnut"
      ]
    },
    {
      groupName: "Fibre Crops",
      commodities: [
        "Ambady/Mesta/Patson", "Cotton", "Jute", "Lint", "Sanai/Sunhemp"
      ]
    },
    {
      groupName: "Flowers",
      commodities: [
        "Anthorium", "Astera", "BOP", "Calendula", "Carnation", "Chrysanthemum", "Chrysanthemum(Loose)", "Clarkia", "Cossandra", "Daila(Chandni)", "Delha", "Flowers-Others", "Gamphrena", "Gerbera", "Gladiolus Bulb", "Gladiolus Cut Flower", "Glardia", "Heliconia species", "Irish", "Jaffri", "Jarbara", "Jasmine", "Kagda", "Kakada", "Kankambra", "Kevda", "Lilly", "Limonia(status)", "Lotus", "Lupine", "Marget", "Marigold(Calcutta)", "Marigold(loose)", "Marikozhunthu", "Nerium", "Orchid", "Patti Calcutta", "Pincushion Flower", "Raibel", "Rose(Local)", "Rose(Loose))", "Rose(Tata)", "Swanflower", "Sweet Sultan", "Tube Flower", "Tube Rose(Double)", "Tube Rose(Loose)", "Tube Rose(Single)", "balsam", "cineraria", "dianthus", "golden rod", "gypsophila", "hydrangea", "kakatan", "salvia", "sevanti", "sweet william", "tulip"
      ]
    },
    {
      groupName: "Forest Products",
      commodities: [
        "Absinthe", "Ambada Seed", "Antawala", "Bamboo", "Bay leaf(Tejpatta)", "Behada", "Bhui Amlaya", "Brahmi", "Broomstick(Flower Broom)", "Cane", "Catechu(Black Cutch/ Khair/Katha)", "Chironji", "Engineered Wood/Processed Wood", "Firewood", "Flower Broom", "Giloy", "Gond", "Gudmar", "Guggal", "Harrah", "Hippe Seed", "Imarti Wood(Good Quality)", "Jute Seed", "Kalihari", "Kalmegh", "Kooth", "Mahua Seed(Hippe seed)", "Neem Seed", "Popular Wood", "Pundi Seed", "Rambans(Agave /Century plant)", "Ratanjot", "Resinwood", "Salix-Pursi(Willow)", "Sandalwood", "Soapnut(Antawala/Retha)", "Tamarind Fruit", "Tamarind Seed", "Torchwood", "Wax", "Wood", "Wood Veneer", "Wooden Stick / Wooden Pole", "gulli", "kokum", "spikenard"
      ]
    },
    {
      groupName: "Fruits",
      commodities: [
        "Amla(Nelli Kai)", "Apple", "Apricot(Jardalu/Khumani)", "Avocado", "Bael", "Banana", "Ber(Zizyphus/Borehannu)", "Bilimbi", "Black Currant", "Blueberry", "Borehannu", "Bread Fruit", "Carissa(Karvand)", "Chakotha", "Cherry", "Chikoos(Sapota)", "Custard Apple(Sharifa)", "Dragon fruit", "Garcinia", "Goose berry(Nellikkai)", "Grapes", "Grey Fruit", "Guava", "Hog Plum", "Indian Sherbet Berry(Phalsa)", "Jack Fruit(Ripe)", "Jamun(Narale Hannu)", "Karbuja(Musk Melon)", "Khirni", "Kinnow", "Kiwi Fruit", "Lime", "Litchi", "Lukad", "Mango", "Mangosteen", "Marasebu", "Mousambi(Sweet Lime)", "Mulberry", "Nearle Hannu", "Nelli Kai", "Orange", "Papaya", "Passion Fruit", "Peach", "Pear(Marasebu)", "Persimon(Japani Fal)", "Pineapple", "Plum", "Pomegranate", "Quince(Nakh)", "Rambutan", "Ramphal", "Seetapal", "Siddota", "Soursop", "Star Fruit(Kamraikh)", "Strawberry", "Tender Coconut", "Water Apple", "Water Melon", "Wild Melon", "Wild lemon", "Wood Apple"
      ]
    },
    {
      groupName: "Live Stock, Poultry, Fisheries",
      commodities: [
        "Bull", "Calf", "Cock", "Cow", "Crab", "Dry Fish", "Duck", "Egg", "Fish", "Goat", "He Buffalo", "Hen", "Ox", "Pigs", "Prawn", "Ram", "She Buffalo", "She Goat", "Sheep", "Shrimp", "Silk Cocoon"
      ]
    },
    {
      groupName: "Oil Seeds",
      commodities: [
        "Castor Seed", "Coconut Seed", "Copra", "Cotton Seed", "Ground Nut Seed", "Groundnut", "Groundnut(Split)", "Gurellu", "Honge seed", "Kuchur - Kusum Seed", "Laha", "Linseed", "Mustard", "Niger Seed(Ramtil)", "Safflower", "Sal Seeds", "Sesamum(Sesame,Gingelly,Til)", "Soha", "Soyabean", "Sunflower", "Sunflower Seed", "Suva(Dill Seed)", "Taramira", "Toria"
      ]
    },
    {
      groupName: "Oils and Fats",
      commodities: [
        "Butter", "Castor Oil", "Coconut Oil", "Dalda", "Ghee", "Gingelly Oil", "Ground Nut Oil", "Mustard Oil"
      ]
    },
    {
      groupName: "Pulses",
      commodities: [
        "Alasande Gram", "Arhar Dal(Tur Dal)", "Arhar(Tur/Red Gram)(Whole)", "Avare Dal", "Beans", "Bengal Gram Dal(Chana Dal)", "Bengal Gram(Gram)(Whole)", "Big Gram", "Black Gram Dal(Urd Dal)", "Black Gram(Urd Beans)(Whole)", "Bullar", "Chennangi Dal", "Chennangi(Whole)", "Cowpea(Lobia/Karamani)", "Dal(Avare)", "Field Gram", "Green Gram Dal(Moong Dal)", "Green Gram(Moong)(Whole)", "Green Peas", "Guar Seed(Cluster Beans Seed)", "Kabuli Chana(Chickpeas-White)", "Karamani", "Kidney Beans(Rajma)", "Kulthi(Horse Gram)", "Lak(Teora)", "Lentil(Masur)(Whole)", "Masur Dal", "Mataki", "Moath Dal", "Other Pulses", "Peas(Dry)", "Red Gram", "Rice Bean", "Tevada", "Thinai(Italian Millet)", "White Peas", "Wild Bean / Pod", "buttery"
      ]
    },
    {
      groupName: "Spices",
      commodities: [
        "Ajwan", "Asgand", "Betelnuts", "Black pepper", "Cardamoms", "Chili Red", "Cinamon(Dalchini)", "Cloves", "Coca", "Coconut", "Corriander seed", "Cummin Seed(Jeera)", "Dry Chillies", "Ginger Seed", "Ginger(Dry)", "Kacholam", "Large Cardamom", "Mace", "Methi Seeds", "Muskmelon Seeds", "Nutmeg", "Pepper garbled", "Pepper ungarbled", "Rayee", "Saffron", "Soanf", "Turmeric", "dried mango", "mango powder", "nigella", "poppy seeds"
      ]
    },
    {
      groupName: "Vegetables",
      commodities: [
        "Aloe Vera", "Alsandikai", "Amaranthus", "Ambat Chuka", "Amranthas Red", "Arrowroot", "Ashgourd", "Baby Corn", "Bajji chilli", "Balekai", "Bamboo Shoot", "Banana - Green", "Banana Leaf", "Banana flower", "Banana stem", "Beetroot", "Bhindi(Ladies Finger)", "Binoula", "Bitter gourd", "Bottle gourd", "Brinjal", "Brocoli", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Chapparad Avare", "Chhappan Kaddu", "Chilly Capsicum", "Chow Chow", "Cluster beans", "Colacasia", "Coriander(Leaves)", "Cowpea(Veg)", "Cucumbar(Kheera)", "Curry Leaf", "Double Beans", "Drumstick", "Duster Beans", "Elephant Yam(Suran)/Amorphophallus", "Field Bean(Anumulu)", "Field Pea", "French Beans(Frasbean)", "Galgal(Lemon)", "Garlic", "Gherkin", "Ghost Pepper(King Chilli)", "Ginger(Green)", "Goosefoot", "Gram Raw(Chholia)", "Green Avare(W)", "Green Chilli", "Groundnut pods(raw)", "Guar", "Indian Beans(Seam)", "Indian Colza(Sarson)", "Jackfruit Seed", "Jackfruit(Green/Raw/Unripe)", "Jamamkhan", "Kartali(Kantola)", "Knool Khol", "Ladies Finger", "Leafy Vegetable", "Leek", "Lemon", "Lesser Yam", "Little gourd(Kundru)", "Long Melon(Kakri)", "Lotus Sticks", "Mango(Raw-Ripe)", "Mashrooms", "Meal Maker (Soya Chunks)", "Mentha(Mint)", "Methi(Leaves)", "Mint(Pudina)", "Onion", "Onion Green", "Other green and fresh vegetables", "Papaya(Raw)", "Pea Pod/Pea Cod/हरी मटर", "Peas Wet", "Pegeon Pea(Arhar Fali)", "Perandai", "Phuee(Leafy Veg)", "Pointed gourd(Parval)", "Pokcha Leafy Veg", "Potato", "Pumpkin", "Purslane", "Raddish", "Rat Tail Radish(Mogari)", "Red Cabbage", "Red Gourd", "Ribbed Celery", "Ridge Gourd(Permal/Hybrid Gourd)", "Ridgeguard(Tori)", "Round Chilli", "Round gourd", "Season Leaves", "Seemebadnekai", "Sem", "Siru Kizhagu", "Snakeguard", "Snow Mountain Garlic", "Spinach", "Sponge gourd", "Squash(Chappal Kadoo)", "Sugar Snap Peas", "Sundaikai", "Surat Beans(Papadi)", "Suvarna Gadde", "Swan Phali(Flat Bean)", "Sweet Potato", "Sweet Pumpkin", "Sweet Saag", "Tapioca", "Taro (Arvi) Leaves", "Taro (Arvi) Stem", "Thogrikai", "Thondekai", "Tinda", "Tomato", "Turmeric(raw)", "Turnip", "White Pumpkin", "Wild Cucumber", "Wild Garlic / Shoots", "Wild Spinach", "Yam Bean / Mexican Turnip(Bankla)", "Yam(Ratalu)"
      ]
    },
    {
      groupName: "Others",
      commodities: [
        "Ajwain Husk", "Bran", "Broken Rice", "Bunch Beans", "Camel Hair", "Cashew Kernnel", "Coconut Coir", "Dhaincha", "Dhaincha(Seed)", "Dry Fodder", "Egypian Clover(Barseem)", "Fig(Anjura/Anjeer)", "Flax seeds", "Goat Hair", "Gramflour", "Green Fodder", "Gur(Jaggery)", "Haralekai", "Hilsa", "Honey", "Javi", "Khandsari(Desi Khand)", "Kharif Mash", "Khoya", "Kuchur", "Ma.Inji", "Mahedi", "Maida Atta", "Maragensu", "Mash", "Millets", "Nargasi", "Polherb", "Pundi", "Rab/Liquid Jaggery/Molasses", "Rajgir", "Raw Biomass(Agro Residue)", "Raya", "Riccbcan", "Rubber", "Sabu Dan", "Sarasum", "Seegu", "Sehuwan (Seed)", "Skin And Hide", "Sompu", "Sugar", "Sugarcane", "Suram", "Tulasi", "Water Plant(Kaseru)", "Water chestnut", "Wheat Atta", "Wool", "Yam"
      ]
    }
  ]
};