let currentLang = 'en';
const translations = {
    en: {
        header: "SG Worker Hub",
        searchPlaceholder: "Search company by name...",
        submitBox: "➕ Submit Company Name & Activities",
        formTitle: "Report a New Company",
        submitBtn: "Submit Report"
    },
    bn: {
        header: "এসজি ওয়ার্কার হাব",
        searchPlaceholder: "কোম্পানির নাম দিয়ে খুঁজুন...",
        submitBox: "➕ কোম্পানির নাম ও কার্যকলাপ জমা দিন",
        formTitle: "নতুন কোম্পানির রিপোর্ট করুন",
        submitBtn: "রিপোর্ট জমা দিন"
    }
};

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'bn' : 'en';
    document.getElementById('header-title').innerText = translations[currentLang].header;
    document.getElementById('search-input').placeholder = translations[currentLang].searchPlaceholder;
    document.getElementById('submit-trigger').innerText = translations[currentLang].submitBox;
    document.getElementById('form-title').innerText = translations[currentLang].formTitle;
    document.getElementById('submit-btn').innerText = translations[currentLang].submitBtn;
}

function toggleSubmitForm() {
    const form = document.getElementById('submit-form');
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
}

