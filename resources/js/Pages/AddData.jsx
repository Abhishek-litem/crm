import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { toast } from "react-toastify";

// Helper function to get the current date and time in the format YYYY-MM-DDTHH:MM
const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const cityOptions = [
    "Bengaluru - Bangalore",
    "Chennai",
    "Cochin",
    "Coimbatore",
    "Delhi",
    "Gurugram - Gurgaon",
    "Hyderabad",
    "Kolkata",
    "Mumbai",
    "Noida",
    "Thiruvananthapuram",
    "Vijayawada",
    "Visakhapatnam",
    "Addanki",
    "Adilabad",
    "Agartala",
    "Agra",
    "Aizawl",
    "Ajmer",
    "Akola",
    "Alappuzha",
    "Aligarh",
    "Allahabad",
    "Alwar",
    "Amaravati",
    "Ambala",
    "Amritsar",
    "Anand",
    "Anantapur",
    "Andaman",
    "Aurangabad",
    "Aurangabad-Bihar",
    "Azamgarh",
    "Badaun",
    "Badlapur",
    "Bagaha",
    "Bagalkot",
    "Bahadurgarh",
    "Baltora",
    "Baraut",
    "Bardhaman",
    "Bareilly",
    "Bathinda",
    "Begusarai",
    "Belgaum",
    "Bellary",
    "Berhampur",
    "Bhadrak",
    "Bhadreswar",
    "Bhagalpur",
    "Bharuch",
    "Bhavnagar",
    "Bhayandar",
    "Bhilai",
    "Bhilwara",
    "Bhiwandi",
    "Bhiwani",
    "Bhopal",
    "Bhubaneswar",
    "Bidar",
    "Bijapur",
    "Bikaner",
    "Bina Etawa",
    "Birati",
    "Birbhum",
    "Bishalgarh",
    "Budgam",
    "Buldhana",
    "Bundi",
    "Cachar",
    "Calicut",
    "Chandauli",
    "Chandigarh",
    "Chandigarh-Punjab",
    "Chhapur",
    "Chhatarpur",
    "Chhindwara",
    "chidambaram",
    "Chitradurga",
    "Chittoor",
    "Chittorgarh",
    "Churu",
    "Cooch Behar",
    "Cuddalore",
    "Cuttack",
    "Dahod",
    "Daman",
    "Darbhanga",
    "Dehradun",
    "Deoghar",
    "Dera Bassi",
    "Dewas",
    "Dhaka",
    "Dhanbad",
    "Dharmapuri",
    "Dharmanagar",
    "Dharwad",
    "Dhule",
    "Dimapur",
    "Dindigul",
    "Dispur",
    "Dombivli",
    "Dumarkunda",
    "Dungri",
    "Dwarka",
    "Eluru",
    "Erode",
    "Faridabad",
    "Firozabad",
    "Firozpur",
    "Gandhidham",
    "Gandhinagar",
    "Gangtok",
    "Ganjam",
    "Gannavaram",
    "Ghaziabad",
    "Gonda",
    "Gorakhpur",
    "Greater Noida",
    "Gulbarga",
    "Guntur",
    "Gunupur",
    "Guwahati",
    "Gwalior",
    "Haldwani",
    "Hansi",
    "Hanumangarh",
    "Haridwar",
    "Hisar",
    "Hoshiarpur",
    "Hosur",
    "Howrah",
    "Hubli",
    "Idukki",
    "Imphal",
    "Indore",
    "Itanagar",
    "Jabalpur",
    "Jagdalpur",
    "Jaipur",
    "Jalandhar",
    "Jalgaon",
    "Jalgaon Jamod",
    "Jamalpur",
    "Jammu",
    "Jamnagar",
    "Jamshedpur",
    "Jamui",
    "Jaunpur",
    "Jhansi",
    "Jind",
    "Jodhpur",
    "Jorhat",
    "Kadapa",
    "Kakinada",
    "Kalahandi",
    "Kalimpong",
    "Kalyan",
    "Kangra",
    "Kankroli",
    "Kannur",
    "Kanpur",
    "Kanyakumari",
    "Kapurthala",
    "Karad",
    "Karaikal",
    "Karimnagar",
    "Karjat",
    "Karur",
    "Karnal",
    "kasganj",
    "Kashipur",
    "Katihar",
    "Katni",
    "Kavaratti",
    "Khamgaon",
    "Khammam",
    "Kharagpur",
    "Khordha",
    "Kochi",
    "Kohima",
    "Kolhapur",
    "Kollam",
    "Koppal",
    "Kota",
    "Kottayam",
    "Kozhikode",
    "Krishnagiri",
    "Kullu",
    "Kumbakonam",
    "Kurnool",
    "Kurukshetra",
    "Lalitpur",
    "Latur",
    "Loharu",
    "Lucknow",
    "Ludhiana",
    "Madhubani",
    "Madikeri",
    "Madurai",
    "Mainpuri",
    "Malappuram",
    "Malda",
    "Mandi",
    "Mandsaur",
    "Mangalore",
    "Mapusa",
    "Margao",
    "Marthandam",
    "Meerut",
    "Midnapore",
    "Mirzapur",
    "Mohali",
    "Morbi",
    "Morena",
    "Muktsar",
    "Mundra",
    "Muzaffarnagar",
    "Muzaffarpur",
    "Mysore",
    "Nabarangpur",
    "Nadiad",
    "Nagapattinam",
    "Nagaur",
    "Nagercoil",
    "Nagpur",
    "Nainital",
    "Nalanda",
    "Namakkal",
    "Nanded",
    "Nandigama",
    "Nashik",
    "Navi Mumbai",
    "Navsari",
    "Nellore",
    "Nilgiris",
    "Nizamabad",
    "Ongole",
    "Ooty",
    "Palakkad",
    "Palampur",
    "Palgadh",
    "Pali",
    "Panaji",
    "Panchkula",
    "Panipat",
    "Paradip",
    "Pathanamthitta",
    "Pathankot",
    "Patiala",
    "Patna",
    "Pilani",
    "Port Blair",
    "Pratapgarh",
    "Puducherry",
    "Pune",
    "Raichur",
    "Raigarh",
    "Raipur",
    "Rajahmundry",
    "Rajapalayam",
    "Rajkot",
    "Ramanathapuram",
    "Ramgarh",
    "Ranchi",
    "Raniganj",
    "Ratlam",
    "Rewa",
    "Rohtak",
    "Roorkee",
    "Rourkela",
    "Rupnagar",
    "Saharanpur",
    "Salem",
    "Sangli",
    "Sangrur",
    "Satara",
    "Secunderabad",
    "Shillong",
    "Shimla",
    "Shimoga",
    "shirdi",
    "Sikar",
    "Siliguri",
    "Silvassa",
    "Singrauli",
    "Sirmaur",
    "Sirmur",
    "Sitamarhi",
    "Sitapur",
    "Sivaganga",
    "Sivakasi",
    "Siwan",
    "Solan",
    "Solapur",
    "Sonipat",
    "Sonla",
    "Sri Ganganagar",
    "Srinagar",
    "Surat",
    "Talbehat",
    "Tezpur",
    "Thalassery",
    "Thane",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Thrissur",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupati",
    "Tirupur",
    "Tiruvannamalai",
    "Tumkur",
    "Udaipur",
    "Udupi",
    "Ujjain",
    "Una",
    "Uppala",
    "Uttarpara",
    "Vadodara",
    "Vapi",
    "Varanasi",
    "Vasai",
    "Vellore",
    "Vidisha",
    "Vill Damla",
    "Viluppuram",
    "Vinukonda",
    "Virar",
    "Virudhunagar",
    "Warangal",
    "Washim",
    "Yamuna Nagar",
    "Yelahanka",
    "Zirakpur",
    "Other Cities",
];

// Tailwind CSS classes for form elements with dark mode support
const inputClasses =
    "mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-800 text-white focus:border-indigo-400 focus:ring focus:ring-indigo-400 focus:ring-opacity-50";

const labelClasses = "block text-sm font-medium text-gray-300";

const errorClasses = "text-sm text-red-400 mt-1";

const buttonClasses =
    "inline-flex items-center px-4 py-2 bg-green-700 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-600 active:bg-green-800 focus:outline-none focus:border-green-800 focus:ring ring-green-500 disabled:opacity-25 transition ease-in-out duration-150";

// Custom DateTimePicker component to simulate a dedicated picker
// In a real application, you would replace this with a library like react-datepicker or react-datetime-picker
const DateTimePicker = ({ id, name, value, onChange, max, required }) => {
    return (
        <input
            type="datetime-local"
            name={name}
            id={id}
            className={inputClasses}
            required={required}
            value={value}
            onChange={onChange}
            max={max}
        />
    );
};

const AddDataForm = ({ phoneProp = "" }) => {
    // Initialize form data with useForm from Inertia.js
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "abc@gmail.com",
        phone: phoneProp,
        cur_date: getCurrentDateTime(),
        pcalls: false,
        pmails: false,
        pwatsp: false,
        pcl: false,
        state: "",
        etype: "",
        follow_up_date: "",
        data_f: phoneProp ? "3" : "2",
        fstatus: "",
        pstatus: "",
        premark: "",
    });

    // Handle form submission
    const submit = (e) => {
        e.preventDefault();

        post(route("add-data"), {
            onSuccess: () => {
                toast.success("Data added successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            },
            onError: (errors) => {
                toast.error("Failed to add data. Please check the form.", {
                    position: "top-right",
                    autoClose: 3000,
                });
                console.error(errors);
            },
            onFinish: () => {
                console.log("Request completed");
            },
        });
    };

    const maxDateTime = getCurrentDateTime();

    return (
        <AuthenticatedLayout
            user={null} // Replace with actual user prop if available
            header={
                <h2 className="font-semibold text-xl text-gray-200 leading-tight">
                    Add Data
                </h2>
            }
        >
            <Head title="Add Data" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Main Card Container - Background changes for dark mode */}
                    <div className="bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 border-b border-gray-700">
                            <div className="space-y-6">
                                <div className="flex flex-col">
                                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                                        <form
                                            onSubmit={submit}
                                            className="space-y-6"
                                        >
                                            {/* Row 1: Name and Email */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="name"
                                                    >
                                                        Name :
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        placeholder="Name"
                                                        required
                                                        className={inputClasses}
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "name",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {errors.name && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="email"
                                                    >
                                                        Email :
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="email"
                                                        id="email"
                                                        placeholder="Email"
                                                        className={inputClasses}
                                                        required
                                                        value={data.email}
                                                        onChange={(e) =>
                                                            setData(
                                                                "email",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {errors.email && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Row 2: Phone and Date (using DateTimePicker) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="phone"
                                                    >
                                                        Phone :
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        id="phone"
                                                        placeholder="Mobile no."
                                                        className={inputClasses}
                                                        value={data.phone}
                                                        onChange={(e) =>
                                                            setData(
                                                                "phone",
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors.phone && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.phone}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="cur_date"
                                                    >
                                                        Date :
                                                    </label>
                                                    <DateTimePicker
                                                        id="cur_date"
                                                        name="cur_date"
                                                        value={data.cur_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                "cur_date",
                                                                e.target.value,
                                                            )
                                                        }
                                                        max={maxDateTime}
                                                        required
                                                    />
                                                    {errors.cur_date && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.cur_date}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Row 3: Followup on Checkboxes */}
                                            <div className="border-t border-gray-700 pt-6 flex flex-col items-center text-center">
                                                <label className="block text-lg font-semibold text-gray-200 mb-4">
                                                    Followup on :
                                                </label>

                                                <div className="flex flex-wrap justify-center gap-10">
                                                    {/* Calls */}
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            name="pcalls"
                                                            value="call"
                                                            id="pcalls"
                                                            className="h-6 w-6 text-indigo-500 rounded bg-gray-800 border-gray-600 checked:bg-indigo-500 focus:ring-indigo-400"
                                                            checked={
                                                                data.pcalls
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "pcalls",
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="pcalls"
                                                            className="text-base text-gray-300"
                                                        >
                                                            Calls
                                                        </label>
                                                    </div>

                                                    {/* Mails */}
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            name="pmails"
                                                            value="emailSent"
                                                            id="pmails"
                                                            className="h-6 w-6 text-indigo-500 rounded bg-gray-800 border-gray-600 checked:bg-indigo-500 focus:ring-indigo-400"
                                                            checked={
                                                                data.pmails
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "pmails",
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="pmails"
                                                            className="text-base text-gray-300"
                                                        >
                                                            Mails
                                                        </label>
                                                    </div>

                                                    {/* WhatsApp */}
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            name="pwatsp"
                                                            value="whatsapp"
                                                            id="pwatsp"
                                                            className="h-6 w-6 text-indigo-500 rounded bg-gray-800 border-gray-600 checked:bg-indigo-500 focus:ring-indigo-400"
                                                            checked={
                                                                data.pwatsp
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "pwatsp",
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="pwatsp"
                                                            className="text-base text-gray-300"
                                                        >
                                                            WhatsApp
                                                        </label>
                                                    </div>

                                                    {/* Hot Lead */}
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            name="pcl"
                                                            value="Hotlead"
                                                            id="callbackCheckbox"
                                                            className="h-6 w-6 text-indigo-500 rounded bg-gray-800 border-gray-600 checked:bg-indigo-500 focus:ring-indigo-400"
                                                            checked={data.pcl}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "pcl",
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="callbackCheckbox"
                                                            className="text-base text-gray-300"
                                                        >
                                                            Hot Lead
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Row 4: Location, Entity Type, Follow Up Date (using DateTimePicker) */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="state"
                                                    >
                                                        Location :
                                                    </label>
                                                    <select
                                                        name="state"
                                                        id="state"
                                                        className={inputClasses}
                                                        aria-required="true"
                                                        value={data.state}
                                                        onChange={(e) =>
                                                            setData(
                                                                "state",
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Select City
                                                        </option>
                                                        {cityOptions.map(
                                                            (city) => (
                                                                <option
                                                                    key={city}
                                                                    value={city}
                                                                >
                                                                    {city}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    {errors.state && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.state}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="etype"
                                                    >
                                                        Entity Type :
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="etype"
                                                        id="etype"
                                                        placeholder="Type"
                                                        className={inputClasses}
                                                        required
                                                        value={data.etype}
                                                        onChange={(e) =>
                                                            setData(
                                                                "etype",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {errors.etype && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.etype}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="hotdate"
                                                    >
                                                        Follow Up Date
                                                    </label>
                                                    <DateTimePicker
                                                        id="hotdate"
                                                        name="follow_up_date"
                                                        value={
                                                            data.follow_up_date
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "follow_up_date",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {errors.follow_up_date && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {
                                                                errors.follow_up_date
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Row 5: Data From, Final Status, Status */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="data_f"
                                                    >
                                                        Data From
                                                    </label>
                                                    <select
                                                        name="data_f"
                                                        id="data_f"
                                                        className={inputClasses}
                                                        required
                                                        value={data.data_f}
                                                        onChange={(e) =>
                                                            setData(
                                                                "data_f",
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="2">
                                                            Whatsapp
                                                        </option>
                                                        <option value="3">
                                                            IVR
                                                        </option>
                                                        <option value="4">
                                                            Normal
                                                        </option>
                                                        <option value="5">
                                                            Abhishek Sir
                                                        </option>
                                                        <option value="6">
                                                            Sahil Sir
                                                        </option>
                                                    </select>
                                                    {errors.data_f && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.data_f}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="final-status"
                                                    >
                                                        Final Status{" "}
                                                    </label>
                                                    <select
                                                        name="fstatus"
                                                        id="final-status"
                                                        className={inputClasses}
                                                        value={data.fstatus}
                                                        onChange={(e) =>
                                                            setData(
                                                                "fstatus",
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            --Select--
                                                        </option>
                                                        <option value="Sales Closed">
                                                            Sales Closed
                                                        </option>
                                                        <option value="Business Converted">
                                                            Business Converted
                                                        </option>
                                                    </select>
                                                    {errors.fstatus && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.fstatus}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                        htmlFor="pstatus"
                                                    >
                                                        Status
                                                    </label>
                                                    <select
                                                        name="pstatus"
                                                        id="pstatus"
                                                        className={inputClasses}
                                                        required
                                                        value={data.pstatus}
                                                        onChange={(e) =>
                                                            setData(
                                                                "pstatus",
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Please select
                                                        </option>
                                                        <option value="In Progress">
                                                            In Progress
                                                        </option>
                                                        <option value="Document Sent">
                                                            Document Sent
                                                        </option>
                                                        <option value="Irrelevant">
                                                            Irrelevant
                                                        </option>
                                                        <option value="Office Visit">
                                                            Office Visit
                                                        </option>
                                                        <option value="Not Pick">
                                                            Not Pick
                                                        </option>
                                                        <option value="Not Interested">
                                                            Not Interested
                                                        </option>
                                                        <option value="Switched off">
                                                            Switched off
                                                        </option>
                                                        <option value="Call back">
                                                            Call back
                                                        </option>
                                                        <option value="Virtual Meeting">
                                                            Virtual Meeting
                                                        </option>
                                                        <option value="Payment Done">
                                                            Payment Done
                                                        </option>
                                                        <option value="Only Query">
                                                            Only Query
                                                        </option>
                                                        <option value="Duplicate Query">
                                                            Duplicate Query
                                                        </option>
                                                        <option value="Unallotted">
                                                            Unallotted
                                                        </option>
                                                        <option value="Wrong Number">
                                                            Wrong Number
                                                        </option>
                                                        <option value="50% Done">
                                                            50% Done
                                                        </option>
                                                        <option value="Language Barrier">
                                                            Language Barrier
                                                        </option>
                                                    </select>
                                                    {errors.pstatus && (
                                                        <div
                                                            className={
                                                                errorClasses
                                                            }
                                                        >
                                                            {errors.pstatus}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Row 6: Remarks */}
                                            <div>
                                                <label
                                                    className={labelClasses}
                                                    htmlFor="premark"
                                                >
                                                    Remarks
                                                </label>
                                                <textarea
                                                    name="premark"
                                                    id="premark"
                                                    rows="4"
                                                    placeholder="Write a comment..."
                                                    className={inputClasses}
                                                    spellCheck="false"
                                                    required
                                                    value={data.premark}
                                                    onChange={(e) =>
                                                        setData(
                                                            "premark",
                                                            e.target.value,
                                                        )
                                                    }
                                                ></textarea>
                                                {errors.premark && (
                                                    <div
                                                        className={errorClasses}
                                                    >
                                                        {errors.premark}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end pt-4 border-t border-gray-200 border-gray-700">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className={buttonClasses}
                                                >
                                                    {processing
                                                        ? "Submitting..."
                                                        : "Submit"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AddDataForm;
