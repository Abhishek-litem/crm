// resources/js/Pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Head, router, usePage } from "@inertiajs/react";
import {
    PhoneIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    BoltIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/solid";
import { X } from "lucide-react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "react-data-table-component";

export default function AllData({
    data,
    filter = "",
    user,
    follow_ups,
    followUpsToday,
}) {
    const props = usePage().props;
    const { auth } = usePage().props;
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [showRemarkModal, setShowRemarkModal] = useState(false);
    const [remarks, setRemarks] = useState([]);
    const [loadingRemarks, setLoadingRemarks] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (follow_ups && follow_ups.length > 0) {
            setShowPopup(true);
        }
    }, [follow_ups]);

    // Filter states
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        user: "",
        data_type: "",
        status: "",
        search: "",
    });
    // AUTO-REFRESH FUNCTIONALITY - Add this useEffect
    useEffect(() => {
        const refreshData = () => {
            router.reload({
                only: ["data", "follow_ups"],
                preserveState: true,
                preserveScroll: true,
            });
        };

        // Set interval for 2 minutes (120000 milliseconds)
        const intervalId = setInterval(refreshData, 120000);

        // Cleanup on unmount
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (follow_ups && follow_ups.length > 0) {
            setShowFollowUpModal(true);
        }
    }, [follow_ups]);

    const getPageTitle = () => {
        return "Main Data";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        });
        const formattedTime = date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return { date: formattedDate, time: formattedTime };
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // You can add a toast notification here
        });
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route("data.delete"), {
            data: { id: deleteId },
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleteId(null);
                toast("Reacord Deleted Succesfully!");
            },
        });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route("all.data"), filters, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilterModal(false);
    };

    const loadRemarks = async (id) => {
        setLoadingRemarks(true);
        setShowRemarkModal(true);

        try {
            // Get CSRF token from multiple sources
            const csrfToken =
                props.csrf_token ||
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") ||
                document.head.querySelector('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                throw new Error("CSRF token not found");
            }

            const response = await fetch(route("get-remark", id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest", // Important for Laravel
                },
                credentials: "same-origin", // Include cookies
            });

            // Check if response is not OK
            if (!response.ok) {
                if (response.status === 419) {
                    toast.error("Session expired. Please refresh the page.");
                    // Optionally reload the page
                    setTimeout(() => window.location.reload(), 2000);
                    return;
                }
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const result = await response.json();

            if (result.success) {
                setRemarks(result.remarks);
            } else {
                setRemarks([]);
                toast.info("No remarks found for this record");
            }
        } catch (error) {
            console.error("Error loading remarks:", error);
            toast.error(`Failed to load remarks: ${error.message}`);
            setRemarks([]);
        } finally {
            setLoadingRemarks(false);
        }
    };

    const breakWords = (text, wordsPerLine) => {
        if (!text || typeof text !== "string") return [""];
        const words = text.split(" ");
        const chunks = [];
        for (let i = 0; i < words.length; i += wordsPerLine) {
            chunks.push(words.slice(i, i + wordsPerLine).join(" "));
        }
        return chunks.length > 0 ? chunks : [""];
    };

    const getWhatsAppUrl = (phone) => {
        const phoneNumber = phone.replace(/[^0-9]/g, "");
        return `https://wa.me/${phoneNumber}`;
    };

    const getCopyText = (item) => {
        return `${item.name}\n${item.email}\n${item.phone}\n${item.title_page}\n${item.q_type}\n${item.state}`;
    };

    const getDataTypeButton = (dataType) => {
        switch (dataType) {
            case 2: // WhatsApp
                return (
                    <button className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center">
                        <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                    </button>
                );

            case 3: // IVR / Call
                return (
                    <button className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors flex items-center justify-center">
                        <PhoneIcon className="w-4 h-4" />
                    </button>
                );

            case 4: // Normal (N)
                return (
                    <button className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center">
                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                    </button>
                );

            case 5: // A
                return (
                    <button className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center">
                        <BoltIcon className="w-4 h-4" />
                    </button>
                );

            case 6: // S
                return (
                    <button className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center">
                        <Squares2X2Icon className="w-4 h-4" />
                    </button>
                );

            default:
                return null;
        }
    };

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) {
            return data;
        }

        const query = searchQuery.toLowerCase().trim();

        return data.filter((item) => {
            // Safely check each field with optional chaining and nullish coalescing
            const name = (item.name || "").toLowerCase();
            const email = (item.email || "").toLowerCase();
            const phone = (item.phone || "").toLowerCase();
            const title_page = (item.title_page || "").toLowerCase();
            const actualQuery = (item.ActulQuery || "").toLowerCase();
            const status = (item.status || "").toLowerCase();
            const allotedUserName = (
                item.alloted_user?.name || ""
            ).toLowerCase();
            const userName = (item.username?.name || "").toLowerCase();
            const id = (item.id || "").toString();

            return (
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                title_page.includes(query) ||
                actualQuery.includes(query) ||
                status.includes(query) ||
                allotedUserName.includes(query) ||
                userName.includes(query) ||
                id.includes(query)
            );
        });
    }, [data, searchQuery]);

    // Define columns for DataTable
    const columns = useMemo(
        () => [
            {
                name: "#",
                selector: (row, index) => index + 1,
                width: "50px",
                sortable: false,
                style: {
                    justifyContent: "center",
                },
            },
            {
                name: "Name",
                width: "150px",
                selector: (row) => row.name,
                cell: (row) => {
                    const chunks = breakWords(row.name, 1); // Only call once

                    return (
                        <div className="text-sm font-bold">
                            {chunks.map((chunk, i) => (
                                <React.Fragment key={i}>
                                    {chunk}
                                    {i < chunks.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    );
                },
                wrap: false,
            },

            {
                name: "Email",
                width: "150px",
                selector: (row) => row.email,
                cell: (row) => (
                    <div className="text-xs">
                        {row.email &&
                            row.email.match(/.{1,15}/g)?.map((chunk, i) => (
                                <React.Fragment key={i}>
                                    {chunk}
                                    <br />
                                </React.Fragment>
                            ))}
                    </div>
                ),
                wrap: true,
            },
            ...(auth?.user?.role !== 4
                ? [
                      {
                          name: "Phone",
                          width: "100px",
                          selector: (row) => row.phone,
                          cell: (row) => (
                              <div className="flex items-center gap-2">
                                  <a
                                      href={getWhatsAppUrl(row.phone)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-xs"
                                  >
                                      {row.phone.replace("+91", "")}
                                  </a>
                                  {row.hotlead === "Hotlead" && (
                                      <i className="fa-solid fa-fire text-orange-500 text-sm animate-pulse"></i>
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),

            {
                name: "Type",
                width: "200px",
                selector: (row) => row.title_page || row.entity_type,
                cell: (row) => {
                    const query = row.title_page || row.entity_type;
                    const typeChunks = breakWords(query, 8);
                    return (
                        <div className="break-words text-xs">
                            {typeChunks.map((chunk, i) => (
                                <React.Fragment key={i}>
                                    {chunk}
                                    {i < typeChunks.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    );
                },
                wrap: true,
            },
            {
                name: "Service",
                width: "200px",
                selector: (row) => row.q_type,
                cell: (row) => {
                    const query = row.q_type;
                    const typeChunks = breakWords(query, 8);
                    return (
                        <div className="break-words text-xs">
                            {typeChunks.map((chunk, i) => (
                                <React.Fragment key={i}>
                                    {chunk}
                                    {i < typeChunks.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    );
                },
                wrap: true,
            },

            {
                name: "State",
                width: "200px",
                selector: (row) => row.state,
                cell: (row) => {
                    const query = row.state;
                    const typeChunks = breakWords(query, 8);
                    return (
                        <div className="break-words text-xs">
                            {typeChunks.map((chunk, i) => (
                                <React.Fragment key={i}>
                                    {chunk}
                                    {i < typeChunks.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    );
                },
                wrap: true,
            },

            {
                name: "Date / Time",
                width: "90px",
                selector: (row) => row.date,
                cell: (row) => {
                    const dateTime = formatDate(row.date);
                    return (
                        <div className="text-xs">
                            {dateTime.date}
                            <br />
                            {dateTime.time}
                        </div>
                    );
                },
            },
            {
                name: "Status",
                width: "90px",
                selector: (row) => row.status,
                cell: (row) => {
                    const statusChunksResult = breakWords(row.status, 1);
                    const statusChunks = Array.isArray(statusChunksResult)
                        ? statusChunksResult
                        : [""];
                    return (
                        <div className="break-words text-xs">
                            {statusChunks.map((chunk, i) => (
                                <React.Fragment key={i}>
                                    {chunk}
                                    {i < statusChunks.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    );
                },
                wrap: true,
            },
            {
                name: "Action",
                cell: (row) => (
                    <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        {row.status !== "Sales Closed" &&
                            row.status !== "Business Converted" &&
                            auth?.user?.role !== 4 && (
                                <a
                                    href={`/edit/${row.mid}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 text-gray-100 bg-green-600 hover:bg-green-700 rounded-md flex items-center justify-center"
                                    title="Edit"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-3.5 h-3.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                                    </svg>
                                </a>
                            )}

                        {/* Delete Button (Role 1 only) */}
                        {auth.user.role === 1 && (
                            <button
                                onClick={() => handleDelete(row.mid)}
                                className="p-2 text-gray-100 bg-red-600 hover:bg-red-700 rounded-md flex items-center justify-center"
                                title="Delete"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        )}

                        {/* Copy Button */}
                        <button
                            onClick={() => copyToClipboard(getCopyText(row))}
                            className="p-2 text-gray-100 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center justify-center relative group"
                            title="Copy"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    width="14"
                                    height="14"
                                    x="8"
                                    y="8"
                                    rx="2"
                                    ry="2"
                                />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                        </button>

                        {/* Data Type Button */}
                        <div className="scale-90">
                            {getDataTypeButton(row.data_type)}
                        </div>
                    </div>
                ),
                width: "150px",
            },
            {
                name: "AllotedTo",
                width: "100px",
                selector: (row) =>
                    row.alloted_user?.name?.substring(0, 5) || "",
                width: "80px",
            },
            {
                name: "Contact",
                cell: (row) => (
                    <div className="flex items-center gap-2">
                        {/* Call Icon */}
                        {row.calls == 1 && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                className="w-5 h-5 text-green-400"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"
                                />
                            </svg>
                        )}

                        {/* Mail Icon */}
                        {row.mails == 1 && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                className="w-5 h-5 text-blue-400"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                />
                            </svg>
                        )}

                        {/* WhatsApp Icon */}
                        {row.watsp == 1 && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 640"
                                fill="currentColor"
                                className="w-5 h-5 text-green-500"
                            >
                                <path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z" />
                            </svg>
                        )}
                    </div>
                ),

                width: "100px",
            },
            {
                name: "CoordinatedBy",
                width: "100px",
                cell: (row) =>
                    row.username?.name && (
                        <a
                            href="javascript:void(0);"
                            onClick={() => loadRemarks(row.id)}
                            className="text-white hover:text-blue-300 text-xs flex items-center gap-1"
                        >
                            {row.username.name}
                            <i className="fa-solid fa-comment"></i>
                        </a>
                    ),
                wrap: true,
            },
            {
                name: "LogCount",
                selector: (row) => row.cms_statuses_count || 0,
                width: "80px",
            },
            {
                name: "UniquID",
                width: "90px",
                selector: (row) => row.id,
                width: "80px",
            },
        ],
        [auth.user.role],
    );

    // Custom styles for DataTable dark mode
    const customStyles = {
        table: {
            style: {
                backgroundColor: "transparent",
            },
        },
        headRow: {
            style: {
                backgroundColor: darkMode ? "#1f2937" : "#f9fafb",
                borderBottomColor: darkMode ? "#374151" : "#e5e7eb",
                color: darkMode ? "#f9fafb" : "#111827",
            },
        },
        headCells: {
            style: {
                fontSize: "11px",
                fontWeight: "600",
                paddingLeft: "8px",
                paddingRight: "8px",
                color: darkMode ? "#f9fafb" : "#111827",
            },
        },
        cells: {
            style: {
                fontSize: "11px",
                padding: "10px  0px",
                color: darkMode ? "#e5e7eb" : "#374151",
            },
        },
        rows: {
            style: {
                backgroundColor: darkMode ? "#111827" : "#ffffff",
                borderBottomColor: darkMode ? "#374151" : "#e5e7eb",
                "&:hover": {
                    backgroundColor: darkMode ? "#1f2937" : "#f9fafb",
                },
            },
            stripedStyle: {
                backgroundColor: darkMode ? "#1f2937" : "#f9fafb",
            },
        },
        pagination: {
            style: {
                backgroundColor: darkMode ? "#111827" : "#ffffff",
                borderTopColor: darkMode ? "#374151" : "#e5e7eb",
                color: darkMode ? "#e5e7eb" : "#374151",
            },
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            // header={
            //     <h2 className="font-semibold text-xl text-gray-200 leading-tight">
            //         {getPageTitle()}
            //     </h2>
            // }
        >
            <Head>
                <title>Dashboard</title>
            </Head>

            <div className="bg-gray-900 min-h-screen">
                <div className=" bg-gray-800 overflow-hidden shadow-sm">
                    <div className="p-2 pt-8 bg-gray-800 border-b  border-gray-700">
                        <div className="flex justify-between items-center mb-4 gap-4">
                            {/* Search Input */}
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone, type, status..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <svg
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filter Button */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-2"
                                    onClick={() => setShowFilterModal(true)}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                        />
                                    </svg>
                                    Filter
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <DataTable
                                columns={columns}
                                data={filteredData} // Changed from 'data' to 'filteredData'
                                customStyles={customStyles}
                                pagination
                                paginationPerPage={25}
                                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                                highlightOnHover
                                striped
                                dense
                                theme={darkMode ? "dark" : "default"}
                                noDataComponent={
                                    <div className="p-8 text-center text-gray-400">
                                        {searchQuery
                                            ? "No matching records found"
                                            : "No data available"}
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <Modal
                    onClose={() => setShowDeleteModal(false)}
                    title="Delete Confirmation"
                    darkMode={darkMode}
                >
                    <p className="text-gray-100 ">
                        Are you sure you want to delete this record?
                    </p>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            onClick={confirmDelete}
                        >
                            Delete
                        </button>
                    </div>
                </Modal>
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <Modal
                    onClose={() => setShowFilterModal(false)}
                    title="Filter"
                    darkMode={darkMode}
                >
                    <form onSubmit={handleFilterSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="start_date"
                                className="block text-sm font-medium text-gray-700  mb-1"
                            >
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                id="start_date"
                                className="w-full px-3 py-2 border  border-gray-600 rounded-md  bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.start_date}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        start_date: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="end_date"
                                className="block text-sm font-medium text-gray-700  mb-1"
                            >
                                End Date
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                id="end_date"
                                className="w-full px-3 py-2 border  border-gray-600 rounded-md  bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.end_date}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        end_date: e.target.value,
                                    })
                                }
                            />
                        </div>
                        {(auth.user.role === 1 || auth.user.role === 2) && (
                            <div className="mb-4">
                                <label
                                    htmlFor="user"
                                    className="block text-sm font-medium text-gray-700  mb-1"
                                >
                                    User
                                </label>
                                <select
                                    className="w-full px-3 py-2 border  border-gray-600 rounded-md  bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    id="user"
                                    value={filters.user}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            user: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">--Select User--</option>
                                    {user.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="mb-4">
                            <label
                                htmlFor="data_type"
                                className="block text-sm font-medium text-gray-700  mb-1"
                            >
                                Data From
                            </label>
                            <select
                                className="w-full px-3 py-2 border  border-gray-600 rounded-md  bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="data_type"
                                value={filters.data_type}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        data_type: e.target.value,
                                    })
                                }
                            >
                                <option value="">--Select Data--</option>
                                <option value="2">WhatsApp</option>
                                <option value="3">IVR</option>
                                <option value="4">Normal</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700  mb-1"
                            >
                                Status
                            </label>
                            <select
                                className="w-full px-3 py-2 border  border-gray-600 rounded-md  bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="status"
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="">Please select</option>
                                <option value="Follow Up">Follow Up</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Document Sent">
                                    Document Sent
                                </option>
                                <option value="Irrelevant">Irrelevant</option>
                                <option value="Office Visit">
                                    Office Visit
                                </option>
                                <option value="Not Pick">Not Pick</option>
                                <option value="Not Interested">
                                    Not Interested
                                </option>
                                <option value="Switched off">
                                    Switched off
                                </option>
                                <option value="Call back">Call back</option>
                                <option value="Virtual Meeting">
                                    Virtual Meeting
                                </option>
                                <option value="Payment Done">
                                    Payment Done
                                </option>
                                <option value="Only Query">Only Query</option>
                                <option value="Duplicate Query">
                                    Duplicate Query
                                </option>
                                <option value="Wrong Number">
                                    Wrong Number
                                </option>
                                <option value="Not Eligible">
                                    Not Eligible
                                </option>
                                <option value="50% Done">50% Done</option>
                                <option value="Language Barrier">
                                    Language Barrier
                                </option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="search"
                                className="block text-sm font-medium text-gray-700  mb-1"
                            >
                                Search
                            </label>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                className="w-full px-3 py-2 border  border-gray-600 rounded-md  bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        search: e.target.value,
                                    })
                                }
                                placeholder="Search by phone, email, entity type, status"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                            Filter
                        </button>
                    </form>
                </Modal>
            )}

            {/* Follow-up Modal */}
            {showFollowUpModal && follow_ups.length > 0 && (
                <Modal
                    onClose={() => setShowFollowUpModal(false)}
                    title="Follow-up Reminder"
                    darkMode={darkMode}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <tbody className="text-sm">
                                <tr className="border-b  border-gray-700">
                                    <td className="px-4 py-2 font-medium text-gray-100 ">
                                        Name
                                    </td>
                                    <td className="px-4 py-2 text-gray-100">
                                        {follow_ups[0].name}
                                    </td>
                                </tr>
                                <tr className="border-b  border-gray-700">
                                    <td className="px-4 py-2 font-medium text-gray-100 ">
                                        Phone
                                    </td>
                                    <td className="px-4 py-2 text-gray-100">
                                        {follow_ups[0].phone}
                                    </td>
                                </tr>
                                <tr className="border-b  border-gray-700">
                                    <td className="px-4 py-2 font-medium text-gray-100 ">
                                        Email
                                    </td>
                                    <td className="px-4 py-2 text-gray-100">
                                        {follow_ups[0].email}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-medium text-gray-100 ">
                                        Entry Type
                                    </td>
                                    <td className="px-4 py-2 text-gray-100">
                                        {follow_ups[0].entity_type}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        <a
                            href={`/edit/${follow_ups[0].id}`}
                            target="_blank"
                            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            rel="noreferrer"
                        >
                            Update Query
                        </a>
                        <button
                            className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                            onClick={() => setShowFollowUpModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}

            {showPopup && followUpsToday.length > 0 && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
                    <div className="bg-gray-900 rounded-lg shadow-lg w-[90%] max-w-4xl p-5 relative border border-gray-700">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-2 right-3 hover:text-red-500 text-gray-400"
                        >
                            ✕
                        </button>

                        {/* Title */}
                        <h2 className="text-lg font-semibold mb-4 text-center text-gray-100">
                            📅 Today's Follow-Ups ({followUpsToday.length})
                        </h2>

                        {/* Table */}
                        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto border border-gray-700 rounded-md">
                            <table className="min-w-full text-sm text-gray-300">
                                <thead className="bg-gray-800 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left border-b border-gray-700">
                                            #
                                        </th>
                                        <th className="px-3 py-2 text-left border-b border-gray-700">
                                            Name
                                        </th>
                                        <th className="px-3 py-2 text-left border-b border-gray-700">
                                            Phone
                                        </th>
                                        <th className="px-3 py-2 text-left border-b border-gray-700">
                                            Follow-Up Time
                                        </th>
                                        <th className="px-3 py-2 text-left border-b border-gray-700">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 text-left border-b border-gray-700">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {followUpsToday.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-800 border-b border-gray-700 transition"
                                        >
                                            <td className="px-3 py-2 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-100">
                                                {item.name}
                                            </td>
                                            <td className="px-3 py-2">
                                                <a
                                                    href={`https://wa.me/91${item.phone}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-green-400 hover:text-green-300"
                                                >
                                                    {item.phone}
                                                </a>
                                            </td>
                                            <td className="px-3 py-2">
                                                {new Date(
                                                    item.follow_up_date,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${
                                                        item.status ===
                                                        "Converted"
                                                            ? "bg-green-700 text-green-100"
                                                            : item.status ===
                                                                "In Progress"
                                                              ? "bg-yellow-700 text-yellow-100"
                                                              : "bg-gray-700 text-gray-200"
                                                    }`}
                                                >
                                                    {item.status || "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <a
                                                    href={`/edit/${item.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                                >
                                                    Edit
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Close Button */}
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remark Modal */}
            {showRemarkModal && (
                <Modal
                    onClose={() => setShowRemarkModal(false)}
                    title="Remarks"
                    darkMode={darkMode}
                >
                    {loadingRemarks ? (
                        <p className=" text-gray-300">Loading remarks...</p>
                    ) : remarks.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2  text-gray-300">
                            {remarks.map((remark, index) => (
                                <li key={index} className="mb-2">
                                    <span>{remark.text}</span>
                                    <br />
                                    <small className=" text-gray-400">
                                        On: {remark.date}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className=" text-gray-300">No remarks found.</p>
                    )}
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}

// Modal Component
function Modal({ children, onClose, title, darkMode = false }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className=" bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b  border-gray-700">
                    <h5 className="text-lg font-semibold  text-gray-100">
                        {title}
                    </h5>

                    <button
                        type="button"
                        className="text-gray-400  hover:text-gray-300 transition-colors"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X />
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
