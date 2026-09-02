export interface Commune {
  name: string;
  nameAr: string;
}

export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
  communes: Commune[];
}

export const WILAYAS: Wilaya[] = [
  {
    code: '01', name: 'Adrar', nameAr: 'أدرار',
    communes: [
      { name: 'Adrar', nameAr: 'أدرار' },
      { name: 'Timimoun', nameAr: 'تيميمون' },
      { name: 'Reggane', nameAr: 'رقيان' },
      { name: 'Aougrout', nameAr: 'أوقروت' },
      { name: 'Timiaouine', nameAr: 'تيمياوين' },
    ],
  },
  {
    code: '02', name: 'Chlef', nameAr: 'الشلف',
    communes: [
      { name: 'Chlef', nameAr: 'الشلف' },
      { name: 'Ténès', nameAr: 'تنس' },
      { name: 'El Karimia', nameAr: 'الكريمية' },
      { name: 'Taougrit', nameAr: 'تاوقريت' },
      { name: 'Beni Haoua', nameAr: 'بني حواء' },
    ],
  },
  {
    code: '03', name: 'Laghouat', nameAr: 'الأغواط',
    communes: [
      { name: 'Laghouat', nameAr: 'الأغواط' },
      { name: 'Aflou', nameAr: 'أفلو' },
      { name: 'Sidi Makhlouf', nameAr: 'سيدي مخلوف' },
      { name: 'Gueltat Sidi Saad', nameAr: 'قلتة سيدي سعد' },
    ],
  },
  {
    code: '04', name: 'Oum El Bouaghi', nameAr: 'أم البواقي',
    communes: [
      { name: 'Oum El Bouaghi', nameAr: 'أم البواقي' },
      { name: 'Aïn Beida', nameAr: 'عين البيضاء' },
      { name: 'Meskiana', nameAr: 'مسكيانة' },
      { name: 'Aïn Fakroun', nameAr: 'عين فكرون' },
    ],
  },
  {
    code: '05', name: 'Batna', nameAr: 'باتنة',
    communes: [
      { name: 'Batna', nameAr: 'باتنة' },
      { name: 'Barika', nameAr: 'بريكة' },
      { name: 'N\'Gaous', nameAr: 'نقاوس' },
      { name: 'Aïn Touta', nameAr: 'عين توتة' },
      { name: 'Merouana', nameAr: 'مروانة' },
    ],
  },
  {
    code: '06', name: 'Béjaïa', nameAr: 'بجاية',
    communes: [
      { name: 'Béjaïa', nameAr: 'بجاية' },
      { name: 'Akbou', nameAr: 'أقبو' },
      { name: 'Sidi Aïch', nameAr: 'سيدي عيش' },
      { name: 'Kherrata', nameAr: 'خراطة' },
      { name: 'Amizour', nameAr: 'عزوز' },
    ],
  },
  {
    code: '07', name: 'Biskra', nameAr: 'بسكرة',
    communes: [
      { name: 'Biskra', nameAr: 'بسكرة' },
      { name: 'Tolga', nameAr: 'تولجة' },
      { name: 'Sidi Okba', nameAr: 'سيدي عقبة' },
      { name: 'El Kantara', nameAr: 'القنطرة' },
      { name: 'M\'Chouneche', nameAr: 'مشونش' },
    ],
  },
  {
    code: '08', name: 'Béchar', nameAr: 'بشار',
    communes: [
      { name: 'Béchar', nameAr: 'بشار' },
      { name: 'Beni Ounif', nameAr: 'بني ونيف' },
      { name: 'Tabelbala', nameAr: 'تبلبالة' },
      { name: 'Kenadsa', nameAr: 'القنادسة' },
    ],
  },
  {
    code: '09', name: 'Blida', nameAr: 'البليدة',
    communes: [
      { name: 'Blida', nameAr: 'البليدة' },
      { name: 'Boufarik', nameAr: 'بوفاريك' },
      { name: 'Mouzaïa', nameAr: 'موزاية' },
      { name: 'Bougara', nameAr: 'بوقرة' },
      { name: 'Chéraga', nameAr: 'الشراقة' },
      { name: 'Dély Ibrahim', nameAr: 'دالي إبراهيم' },
      { name: 'El Affroun', nameAr: 'العفرون' },
    ],
  },
  {
    code: '10', name: 'Bouira', nameAr: 'البويرة',
    communes: [
      { name: 'Bouira', nameAr: 'البويرة' },
      { name: 'Sour El Ghozlane', nameAr: 'سور الغزلان' },
      { name: 'Aïn Bessem', nameAr: 'عين بسام' },
      { name: 'Bouderbala', nameAr: 'بودربالة' },
    ],
  },
  {
    code: '11', name: 'Tamanrasset', nameAr: 'تمنراست',
    communes: [
      { name: 'Tamanrasset', nameAr: 'تمنراست' },
      { name: 'Abalessa', nameAr: 'ابلس' },
      { name: 'Idlès', nameAr: 'إدلس' },
      { name: 'Tinzaouatène', nameAr: 'تين زاوتين' },
    ],
  },
  {
    code: '12', name: 'Tébessa', nameAr: 'تبسة',
    communes: [
      { name: 'Tébessa', nameAr: 'تبسة' },
      { name: 'Bir El Ater', nameAr: 'بئر العاتر' },
      { name: 'El Kalaâ', nameAr: 'القالة' },
      { name: 'Negrine', nameAr: 'نقرن' },
    ],
  },
  {
    code: '13', name: 'Tlemcen', nameAr: 'تلمسان',
    communes: [
      { name: 'Tlemcen', nameAr: 'تلمسان' },
      { name: 'Maghnia', nameAr: 'مغنية' },
      { name: 'Ghazaouet', nameAr: 'غزوات' },
      { name: 'Nedroma', nameAr: 'ندرومة' },
      { name: 'Beni M\'Hamed', nameAr: 'بني صاحب' },
    ],
  },
  {
    code: '14', name: 'Tiaret', nameAr: 'تيارت',
    communes: [
      { name: 'Tiaret', nameAr: 'تيارت' },
      { name: 'Aïn Deheb', nameAr: 'عين الذهب' },
      { name: 'Mahdia', nameAr: 'مهدية' },
      { name: 'Frenda', nameAr: 'فرندة' },
    ],
  },
  {
    code: '15', name: 'Tizi Ouzou', nameAr: 'تيزي وزو',
    communes: [
      { name: 'Tizi Ouzou', nameAr: 'تيزي وزو' },
      { name: 'Azazga', nameAr: 'عزازقة' },
      { name: 'Aïn El Hammam', nameAr: 'عين الحمام' },
      { name: 'Draâ El Mizan', nameAr: 'ذراع الميزان' },
      { name: 'Ouadhias', nameAr: 'واضية' },
      { name: 'Azeffoun', nameAr: 'azeffoun' },
    ],
  },
  {
    code: '16', name: 'Alger', nameAr: 'الجزائر',
    communes: [
      { name: 'Alger Centre', nameAr: 'الجزائر الوسطى' },
      { name: 'Bab El Oued', nameAr: 'باب الوادي' },
      { name: 'Sidi M\'Hamed', nameAr: 'سيدي امحمد' },
      { name: 'El Biar', nameAr: 'البيار' },
      { name: 'Bouzareah', nameAr: 'بوزرعة' },
      { name: 'Draria', nameAr: 'درارية' },
      { name: 'Dély Ibrahim', nameAr: 'دالي إبراهيم' },
      { name: 'Hussein Dey', nameAr: 'حسين داي' },
      { name: 'Kouba', nameAr: 'القبة' },
      { name: 'Bir Mourad Raïs', nameAr: 'بئر مراد رايس' },
      { name: 'Hydra', nameAr: 'حيدرة' },
      { name: 'Ben Aknoun', nameAr: 'بن عكنون' },
      { name: 'El Harrach', nameAr: 'الحراش' },
      { name: 'Birtouta', nameAr: 'بئر توطة' },
      { name: 'Zeralda', nameAr: 'زرالدة' },
      { name: 'Draria', nameAr: 'درارية' },
    ],
  },
  {
    code: '17', name: 'Djelfa', nameAr: 'الجلفة',
    communes: [
      { name: 'Djelfa', nameAr: 'الجلفة' },
      { name: 'Messaad', nameAr: 'مسعد' },
      { name: 'Aïn Oussera', nameAr: 'عين وسارة' },
      { name: 'Hassi Bahbah', nameAr: 'حاسي بهbah' },
    ],
  },
  {
    code: '18', name: 'Jijel', nameAr: 'جيجل',
    communes: [
      { name: 'Jijel', nameAr: 'جيجل' },
      { name: 'Taher', nameAr: 'الطاهير' },
      { name: 'El Ancer', nameAr: 'العنصر' },
      { name: 'Sidi Abdelaziz', nameAr: 'سيدي عبد العزيز' },
    ],
  },
  {
    code: '19', name: 'Sétif', nameAr: 'سطيف',
    communes: [
      { name: 'Sétif', nameAr: 'سطيف' },
      { name: 'El Eulma', nameAr: 'العلمة' },
      { name: 'Aïn Oulmene', nameAr: 'عين أولمكنت' },
      { name: 'Bougaa', nameAr: 'بوقاعة' },
      { name: 'Aïn Arnat', nameAr: 'عين أرنات' },
    ],
  },
  {
    code: '20', name: 'Saïda', nameAr: 'سعيدة',
    communes: [
      { name: 'Saïda', nameAr: 'سعيدة' },
      { name: 'El Hassasna', nameAr: 'الحساسنة' },
      { name: 'Aïn El Hadjar', nameAr: 'عين الحجر' },
      { name: 'Sidi Boubekeur', nameAr: 'سيدي بوبكر' },
    ],
  },
  {
    code: '21', name: 'Skikda', nameAr: 'سكيكدة',
    communes: [
      { name: 'Skikda', nameAr: 'سكيكدة' },
      { name: 'El Hadaiek', nameAr: 'الحدائق' },
      { name: 'Azzaba', nameAr: 'عزابة' },
      { name: 'Collo', nameAr: 'القالة' },
    ],
  },
  {
    code: '22', name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس',
    communes: [
      { name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس' },
      { name: 'Télagh', nameAr: 'تلاغ' },
      { name: 'Aïn Thrid', nameAr: 'عين تاردة' },
      { name: 'Ben Badis', nameAr: 'بن باديس' },
    ],
  },
  {
    code: '23', name: 'Annaba', nameAr: 'عنابة',
    communes: [
      { name: 'Annaba', nameAr: 'عنابة' },
      { name: 'El Bouni', nameAr: 'الحجار' },
      { name: 'El Hadjar', nameAr: 'الحجار' },
      { name: 'Berrahal', nameAr: 'برحال' },
    ],
  },
  {
    code: '24', name: 'Guelma', nameAr: 'قالمة',
    communes: [
      { name: 'Guelma', nameAr: 'قالمة' },
      { name: 'Bouati Mahmoud', nameAr: 'بوعاتي محمود' },
      { name: 'Héliopolis', nameAr: 'هيليوبوليس' },
      { name: 'Aïn SANDY', nameAr: 'عينanity' },
    ],
  },
  {
    code: '25', name: 'Constantine', nameAr: 'قسنطينة',
    communes: [
      { name: 'Constantine', nameAr: 'قسنطينة' },
      { name: 'El Khroub', nameAr: 'الخروب' },
      { name: 'Aïn Smara', nameAr: 'عين سمارة' },
      { name: 'Didouche Mourad', nameAr: 'didouche mourad' },
      { name: 'Hamma Bouziane', nameAr: 'حامة بوزيان' },
    ],
  },
  {
    code: '26', name: 'Médéa', nameAr: 'المدية',
    communes: [
      { name: 'Médéa', nameAr: 'المدية' },
      { name: 'Berrouaghia', nameAr: 'برواقية' },
      { name: 'Ksar El Boukhari', nameAr: 'قصر البخاري' },
      { name: 'Aïn Boucif', nameAr: 'عين بوسيف' },
    ],
  },
  {
    code: '27', name: 'Mostaganem', nameAr: 'مستغانم',
    communes: [
      { name: 'Mostaganem', nameAr: 'مستغانم' },
      { name: 'Mascara', nameAr: 'معسكر' },
      { name: 'Sidi Ali', nameAr: 'سيدي علي' },
      { name: 'Aïn Tadles', nameAr: 'عين تادلس' },
    ],
  },
  {
    code: '28', name: 'M\'Sila', nameAr: 'المسيلة',
    communes: [
      { name: 'M\'Sila', nameAr: 'المسيلة' },
      { name: 'Bou Saâda', nameAr: 'بوسعادة' },
      { name: 'Aïn El Hadjel', nameAr: 'عين الحجل' },
      { name: 'Sidi Aïssa', nameAr: 'سيدي عيسى' },
    ],
  },
  {
    code: '29', name: 'Mascara', nameAr: 'معسكر',
    communes: [
      { name: 'Mascara', nameAr: 'معسكر' },
      { name: 'Sig', nameAr: 'سig' },
      { name: 'Tighennif', nameAr: 'تيgfennif' },
      { name: 'Aïn Fekan', nameAr: 'عين فكان' },
    ],
  },
  {
    code: '30', name: 'Ouargla', nameAr: 'ورقلة',
    communes: [
      { name: 'Ouargla', nameAr: 'ورقلة' },
      { name: 'Hassi Messaoud', nameAr: 'حاسي مسعود' },
      { name: 'Rouissat', nameAr: 'الرويسات' },
      { name: 'Sidi Khouiled', nameAr: 'سيدي خويلد' },
    ],
  },
  {
    code: '31', name: 'Oran', nameAr: 'وهران',
    communes: [
      { name: 'Oran', nameAr: 'وهران' },
      { name: 'Es Senia', nameAr: 'السانية' },
      { name: 'Bir El Djir', nameAr: 'بئر الجير' },
      { name: 'Aïn Turk', nameAr: 'عين الترك' },
      { name: 'Arzew', nameAr: 'أرزيو' },
      { name: 'Bouteldja', nameAr: 'بوتalgجة' },
    ],
  },
  {
    code: '32', name: 'El Bayadh', nameAr: 'البيض',
    communes: [
      { name: 'El Bayadh', nameAr: 'البيض' },
      { name: 'Bougtif', nameAr: 'بو_gtif' },
      { name: 'Ras El Aioun', nameAr: 'رأس العيون' },
      { name: 'Bouzeguène', nameAr: 'بوزقن' },
    ],
  },
  {
    code: '33', name: 'Illizi', nameAr: 'إليزي',
    communes: [
      { name: 'Illizi', nameAr: 'إليزي' },
      { name: 'Bordj El Haouas', nameAr: 'برج الحواس' },
      { name: 'Djanet', nameAr: 'جانت' },
    ],
  },
  {
    code: '34', name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج',
    communes: [
      { name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج' },
      { name: 'Bordj Zemoura', nameAr: 'برج زمورة' },
      { name: 'Ras El Oued', nameAr: 'رأس الوادي' },
      { name: 'El Hamadia', nameAr: 'الحمادية' },
    ],
  },
  {
    code: '35', name: 'Boumerdès', nameAr: 'بومرداس',
    communes: [
      { name: 'Boumerdès', nameAr: 'بومرداس' },
      { name: 'Thénia', nameAr: 'الثنية' },
      { name: 'Boudouaou', nameAr: 'بودواو' },
      { name: 'Khemis El Khechna', nameAr: 'خmis الخنーシة' },
      { name: 'Isser', nameAr: 'يسر' },
      { name: 'Naciria', nameAr: 'الناصية' },
    ],
  },
  {
    code: '36', name: 'El Tarf', nameAr: 'الطارف',
    communes: [
      { name: 'El Tarf', nameAr: 'الطارف' },
      { name: 'El Kala', nameAr: 'القالة' },
      { name: 'Bouhadjar', nameAr: 'بوجعفر' },
      { name: 'Ben M\'Hidi', nameAr: 'بني مهدي' },
    ],
  },
  {
    code: '37', name: 'Tindouf', nameAr: 'تندوف',
    communes: [
      { name: 'Tindouf', nameAr: 'تندوف' },
      { name: 'Oum Toub', nameAr: 'أم الطوب' },
    ],
  },
  {
    code: '38', name: 'Tissemsilt', nameAr: 'تيسمسيلت',
    communes: [
      { name: 'Tissemsilt', nameAr: 'تيسمسيلت' },
      { name: 'Bordj Emir Abdelkader', nameAr: 'برج الأمير عبد القادر' },
      { name: 'Lardjem', nameAr: 'لرجام' },
      { name: 'Slimane', nameAr: 'سليمان' },
    ],
  },
  {
    code: '39', name: 'El Oued', nameAr: 'الوادي',
    communes: [
      { name: 'El Oued', nameAr: 'الوادي' },
      { name: 'Robbah', nameAr: 'urbah' },
      { name: 'El Meghaier', nameAr: 'المغير' },
      { name: 'Bayadha', nameAr: 'البويرة' },
    ],
  },
  {
    code: '40', name: 'Khenchela', nameAr: 'خنشلة',
    communes: [
      { name: 'Khenchela', nameAr: 'خنشلة' },
      { name: 'Ouled Rechache', nameAr: 'أولاد رشاش' },
      { name: 'Bouhmama', nameAr: 'بومعزة' },
      { name: 'El Hamma', nameAr: 'الحمة' },
    ],
  },
  {
    code: '41', name: 'Souk Ahras', nameAr: 'سوق أهراس',
    communes: [
      { name: 'Souk Ahras', nameAr: 'سوق أهراس' },
      { name: 'Sedrata', nameAr: 'سدراتة' },
      { name: 'M\'Daourouch', nameAr: 'مداوروش' },
      { name: 'Aïn Zara', nameAr: 'عين زارة' },
    ],
  },
  {
    code: '42', name: 'Tipaza', nameAr: 'تيبازة',
    communes: [
      { name: 'Tipaza', nameAr: 'تيبازة' },
      { name: 'Kolea', nameAr: 'القليعة' },
      { name: 'Cherchell', nameAr: 'شرشال' },
      { name: 'Dellys', nameAr: 'دليش' },
      { name: 'Bou Ismaïl', nameAr: 'بو اسماعيل' },
      { name: 'Hamiz', nameAr: 'حميز' },
    ],
  },
  {
    code: '43', name: 'Mila', nameAr: 'ميلة',
    communes: [
      { name: 'Mila', nameAr: 'ميلة' },
      { name: 'Grarem Gouga', nameAr: 'الغرامة' },
      { name: 'Rouached', nameAr: 'رواشد' },
      { name: 'Tadjenanet', nameAr: 'تاجنانت' },
    ],
  },
  {
    code: '44', name: 'Aïn Defla', nameAr: 'عين الدفلى',
    communes: [
      { name: 'Aïn Defla', nameAr: 'عين الدفلى' },
      { name: 'Miliana', nameAr: 'مليانة' },
      { name: 'Boumedfaa', nameAr: 'بومدفع' },
      { name: 'Khemis Miliana', nameAr: 'خميص مليانة' },
    ],
  },
  {
    code: '45', name: 'Naâma', nameAr: 'النعامة',
    communes: [
      { name: 'Naâma', nameAr: 'النعامة' },
      { name: 'Moghrar', nameAr: 'مغرار' },
      { name: 'Aïn Sefra', nameAr: 'عين الصفراء' },
      { name: 'Sfissifa', nameAr: 'سفيصيفة' },
    ],
  },
  {
    code: '46', name: 'Aïn Témouchent', nameAr: 'عين تموشنت',
    communes: [
      { name: 'Aïn Témouchent', nameAr: 'عين تموشنت' },
      { name: 'El Malah', nameAr: 'المالح' },
      { name: 'Hammam Bou Hadjar', nameAr: 'حمام بوجediator' },
      { name: 'Beni Saf', nameAr: 'بني saf' },
    ],
  },
  {
    code: '47', name: 'Ghardaïa', nameAr: 'غرداية',
    communes: [
      { name: 'Ghardaïa', nameAr: 'غرداية' },
      { name: 'Metlili', nameAr: 'متليلي' },
      { name: 'El Meniaa', nameAr: 'المنيعة' },
      { name: 'Djelfa', nameAr: 'الجلفة' },
    ],
  },
  {
    code: '48', name: 'Relizane', nameAr: 'غليزان',
    communes: [
      { name: 'Relizane', nameAr: 'غليزان' },
      { name: 'Mendes', nameAr: 'منداس' },
      { name: 'Zemoura', nameAr: 'زمورة' },
      { name: 'Aïn Taref', nameAr: 'عين tariff' },
    ],
  },
  {
    code: '49', name: 'El M\'Ghair', nameAr: 'المغير',
    communes: [
      { name: 'El M\'Ghair', nameAr: 'المغير' },
      { name: 'Sidi Amrane', nameAr: 'سيدي عمار' },
      { name: 'M\'Rara', nameAr: 'مَرَارة' },
    ],
  },
  {
    code: '50', name: 'El Meniaa', nameAr: 'المنيعة',
    communes: [
      { name: 'El Meniaa', nameAr: 'المنيعة' },
      { name: 'Hassi Gara', nameAr: 'حاسي قارة' },
      { name: 'Mansoura', nameAr: 'المنصورة' },
    ],
  },
  {
    code: '51', name: 'Ouled Djellal', nameAr: 'أولاد جلال',
    communes: [
      { name: 'Ouled Djellal', nameAr: 'أولاد جلال' },
      { name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار' },
    ],
  },
  {
    code: '52', name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار',
    communes: [
      { name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار' },
      { name: 'Timiaouine', nameAr: 'تيمياوين' },
    ],
  },
  {
    code: '53', name: 'Béni Abbès', nameAr: 'بني عباس',
    communes: [
      { name: 'Béni Abbès', nameAr: 'بني عباس' },
      { name: 'Ksabi', nameAr: 'القصابي' },
    ],
  },
  {
    code: '54', name: 'Timimoun', nameAr: 'تيميمون',
    communes: [
      { name: 'Timimoun', nameAr: 'تيميمون' },
      { name: 'Charouine', nameAr: 'شروين' },
    ],
  },
  {
    code: '55', name: 'Touggourt', nameAr: 'توقرت',
    communes: [
      { name: 'Touggourt', nameAr: 'توقرت' },
      { name: 'Taibet', nameAr: 'الطيبات' },
    ],
  },
  {
    code: '56', name: 'Djanet', nameAr: 'جانت',
    communes: [
      { name: 'Djanet', nameAr: 'جانت' },
      { name: 'Bordj El Haouas', nameAr: 'برج الحواس' },
    ],
  },
  {
    code: '57', name: 'In Salah', nameAr: 'عين صالح',
    communes: [
      { name: 'In Salah', nameAr: 'عين صالح' },
      { name: 'Foggaret Ezzaouia', nameAr: 'فقارة الزاوية' },
    ],
  },
  {
    code: '58', name: 'In Guezzam', nameAr: 'عين قزام',
    communes: [
      { name: 'In Guezzam', nameAr: 'عين قزام' },
      { name: 'Tin Zaouatine', nameAr: 'تين زاوتين' },
    ],
  },
];

export function getWilayaByCode(code: string): Wilaya | undefined {
  return WILAYAS.find((w) => w.code === code);
}

export function getCommunesByWilaya(wilayaCode: string): Commune[] {
  const wilaya = getWilayaByCode(wilayaCode);
  return wilaya?.communes || [];
}
