import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
    parseMeetingDays, parseTo24h, addMinutes,
    estimateDuration, timeToFloat,
} from "../../utils/courseUtils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 20;
const HOURS_RANGE = END_HOUR - START_HOUR;
const COLORS = [
    "#006853", "#059669", "#10b981", "#0d9488",
    "#047857", "#065f46", "#14b8a6", "#0f766e",
    "#1d4ed8", "#7c3aed", "#b45309", "#be123c",
];

function hashCrn(crn) {
    let h = 0;
    for (let i = 0; i < crn.length; i++) h = (h * 31 + crn.charCodeAt(i)) >>> 0;
    return h;
}

function fmt(time24) {
    const [h, m] = time24.split(":").map(Number);
    const p = h >= 12 ? "PM" : "AM";
    const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${d}:${String(m).padStart(2, "0")} ${p}`;
}

function el(tag, styles, text) {
    const node = document.createElement(tag);
    if (styles) Object.assign(node.style, styles);
    if (text !== undefined) node.textContent = text;
    return node;
}

export default function ExportButton({ registered, conflicts = new Set() }) {
    const handleExport = async () => {
        if (!registered?.length) return;

        const PW = 1100, PH = 820;
        const PAD = 18;
        const HEADER_H = 42;
        const LEFT_W = 205;
        const GAP = 12;
        const BODY_TOP = HEADER_H + PAD;
        const BODY_H = PH - BODY_TOP - PAD;
        const TIME_COL_W = 44;
        const GRID_HEADER_H = 24;
        const totalCredits = registered.reduce((s, c) => s + (c.credits || 0), 0);

        const container = el("div", {
            position: "absolute", top: "-9999px", left: "-9999px",
            width: `${PW}px`, height: `${PH}px`,
            backgroundColor: "#f0f4f3",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            boxSizing: "border-box", overflow: "hidden",
        });

        // ── Header ──────────────────────────────────────────────────────────────
        const header = el("div", {
            position: "absolute", top: "0", left: "0",
            width: "100%", height: `${HEADER_H}px`,
            backgroundColor: "#0F3B2E",
            display: "flex", alignItems: "center",
            padding: "0 18px", boxSizing: "border-box", gap: "8px",
        });
        const userId = localStorage.getItem("userId") || "My Schedule";
        header.appendChild(el("span", { color: "white", fontSize: "15px", fontWeight: "700" }, "Uni-Plan"));
        header.appendChild(el("span", { color: "#a7d9cc", fontSize: "12px" }, `· ${userId}`));
        header.appendChild(el("div", { flex: "1" }));
        header.appendChild(el("span", {
            color: "rgba(255,255,255,0.55)", fontSize: "10px",
        }, new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })));
        container.appendChild(header);

        // ── Body ─────────────────────────────────────────────────────────────────
        const body = el("div", {
            position: "absolute",
            top: `${BODY_TOP + 6}px`, left: `${PAD}px`,
            width: `${PW - PAD * 2}px`, height: `${BODY_H - 6}px`,
            display: "flex", gap: `${GAP}px`,
        });

        // ── Left Panel ───────────────────────────────────────────────────────────
        const leftPanel = el("div", {
            width: `${LEFT_W}px`, flexShrink: "0", height: "100%",
            backgroundColor: "white", borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.09)", overflow: "hidden",
            display: "flex", flexDirection: "column",
        });

        const lHead = el("div", {
            padding: "9px 11px 7px",
            borderBottom: "1px solid #e2e8f0", flexShrink: "0",
        });
        lHead.appendChild(el("div", { fontSize: "11px", fontWeight: "700", color: "#1e293b" }, "My Schedule"));
        lHead.appendChild(el("div", {
            fontSize: "9px", color: "#64748b", marginTop: "2px",
        }, `${registered.length} course${registered.length !== 1 ? "s" : ""} · ${totalCredits} credits`));
        leftPanel.appendChild(lHead);

        const courseList = el("div", {
            flex: "1", padding: "6px 7px",
            display: "flex", flexDirection: "column", gap: "4px",
            overflow: "hidden",
        });
        registered.forEach((course) => {
            const color = conflicts.has(course.crn)
                ? "#dc2626"
                : COLORS[hashCrn(course.crn) % COLORS.length];
            const location = [course.building, course.room].filter(Boolean).join(" ");

            const item = el("div", {
                backgroundColor: "#f8fafc",
                border: "1px solid #e8edf3",
                borderLeft: `3px solid ${color}`,
                borderRadius: "5px", padding: "4px 6px",
                flexShrink: "0",
            });
            item.appendChild(el("div", { fontSize: "9.5px", fontWeight: "700", color: "#1e293b" }, course.courseCode));
            item.appendChild(el("div", {
                fontSize: "8.5px", color: "#334155", marginTop: "1px", lineHeight: "1.3",
            }, course.name));
            item.appendChild(el("div", {
                fontSize: "8px", color: "#64748b", marginTop: "2px",
            }, `${course.credits} cr · ${course.meetingDays} ${course.meetingTime}${location ? ` · ${location}` : ""}`));
            courseList.appendChild(item);
        });
        leftPanel.appendChild(courseList);

        const lFoot = el("div", {
            padding: "6px 11px", borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc", flexShrink: "0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
        });
        lFoot.appendChild(el("span", { fontSize: "9px", color: "#64748b" }, "Total Credits"));
        lFoot.appendChild(el("span", {
            fontSize: "10px", fontWeight: "700",
            color: totalCredits > 18 ? "#dc2626" : "#0F3B2E",
        }, `${totalCredits} / 18`));
        leftPanel.appendChild(lFoot);
        body.appendChild(leftPanel);

        // ── Right Panel ──────────────────────────────────────────────────────────
        const rightPanel = el("div", {
            flex: "1", height: "100%",
            backgroundColor: "white", borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.09)", overflow: "hidden",
            display: "flex", flexDirection: "column",
        });

        const rHead = el("div", {
            padding: "7px 12px", borderBottom: "1px solid #e2e8f0",
            flexShrink: "0", display: "flex", alignItems: "center",
            justifyContent: "space-between",
        });
        rHead.appendChild(el("div", { fontSize: "11px", fontWeight: "700", color: "#1e293b" }, "Weekly Schedule"));
        rHead.appendChild(el("div", {
            fontSize: "9px", color: "#64748b",
            backgroundColor: "#f1f5f9", padding: "2px 7px", borderRadius: "999px",
        }, `${registered.length} course${registered.length !== 1 ? "s" : ""}`));
        rightPanel.appendChild(rHead);

        const grid = el("div", {
            flex: "1", display: "flex", overflow: "hidden",
        });

        // Time column
        const timeCol = el("div", {
            width: `${TIME_COL_W}px`, flexShrink: "0",
            display: "flex", flexDirection: "column",
        });
        timeCol.appendChild(el("div", { height: `${GRID_HEADER_H}px`, flexShrink: "0" }));
        for (let h = START_HOUR; h <= END_HOUR; h++) {
            const p = h >= 12 ? "PM" : "AM";
            const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
            timeCol.appendChild(el("div", {
                flex: "1", display: "flex", alignItems: "flex-start",
                justifyContent: "flex-end", paddingRight: "5px", paddingTop: "1px",
                fontSize: "7.5px", color: "#94a3b8",
                borderBottom: h < END_HOUR ? "1px solid #f1f5f9" : "none",
                boxSizing: "border-box",
            }, `${d}:00 ${p}`));
        }
        grid.appendChild(timeCol);

        // Day columns
        DAYS.forEach((day) => {
            const dayCol = el("div", {
                flex: "1", display: "flex", flexDirection: "column",
                borderLeft: "1px solid #e2e8f0",
            });
            dayCol.appendChild(el("div", {
                height: `${GRID_HEADER_H}px`, flexShrink: "0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "9px", fontWeight: "700", color: "#1e293b",
                backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0",
                boxSizing: "border-box",
            }, day));

            const slots = el("div", { flex: "1", position: "relative" });

            for (let i = 0; i <= HOURS_RANGE; i++) {
                slots.appendChild(el("div", {
                    position: "absolute", left: "0", right: "0",
                    top: `${(i / HOURS_RANGE) * 100}%`,
                    borderTop: "1px solid #f1f5f9",
                }));
            }

            registered.forEach((course) => {
                if (!parseMeetingDays(course.meetingDays).includes(day)) return;

                const start24 = parseTo24h(course.meetingTime);
                const end24 = addMinutes(start24, estimateDuration(course.meetingDays));
                const top = ((timeToFloat(start24) - START_HOUR) / HOURS_RANGE) * 100;
                const height = Math.max(((timeToFloat(end24) - timeToFloat(start24)) / HOURS_RANGE) * 100, 3);
                const color = conflicts.has(course.crn)
                    ? "#dc2626"
                    : COLORS[hashCrn(course.crn) % COLORS.length];
                const location = [course.building, course.room].filter(Boolean).join(" ");

                const block = el("div", {
                    position: "absolute", left: "1px", right: "1px",
                    top: `${top}%`, height: `${height}%`,
                    backgroundColor: color, borderRadius: "3px",
                    overflow: "hidden", padding: "2px 3px", boxSizing: "border-box",
                });
                block.appendChild(el("div", {
                    fontSize: "8px", fontWeight: "700", color: "white", lineHeight: "1.2",
                }, course.courseCode));
                block.appendChild(el("div", {
                    fontSize: "7px", color: "rgba(255,255,255,0.85)", lineHeight: "1.2",
                }, fmt(start24)));
                if (location) {
                    block.appendChild(el("div", {
                        fontSize: "7px", color: "rgba(255,255,255,0.75)", lineHeight: "1.2",
                    }, location));
                }
                slots.appendChild(block);
            });

            dayCol.appendChild(slots);
            grid.appendChild(dayCol);
        });

        rightPanel.appendChild(grid);
        body.appendChild(rightPanel);
        container.appendChild(body);
        document.body.appendChild(container);

        const canvas = await html2canvas(container, {
            scale: 1.5, useCORS: true, allowTaint: true,
            backgroundColor: "#f0f4f3", width: PW, height: PH,
        });
        document.body.removeChild(container);

        const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.88), "JPEG", 0, 0, pw, ph);
        pdf.save("my_schedule.pdf");
    };

    return (
        <button
            onClick={handleExport}
            className="px-3 py-1 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9H13V5.5h-2V11H8.5l3.5 3.5 3.5-3.5z" />
            </svg>
            Download PDF
        </button>
    );
}
