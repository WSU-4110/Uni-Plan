import html2pdf from "html2pdf.js";

export default function ExportButton({ myScheduleRef, weeklyScheduleRef }) {
    const handleExport = async () => {
        console.log("Export button clicked");

        if (!myScheduleRef?.current || !weeklyScheduleRef?.current) {
            console.error("Refs not available:", { myScheduleRef: !!myScheduleRef?.current, weeklyScheduleRef: !!weeklyScheduleRef?.current });
            return;
        }

        try {
            // Create a container to hold both schedules
            const container = document.createElement("div");
            container.style.padding = "20px";
            container.style.backgroundColor = "white";
            container.style.width = "100%";
            container.style.fontFamily = "Arial, sans-serif";

            // Clone and add My Schedule
            const myScheduleClone = myScheduleRef.current.cloneNode(true);
            myScheduleClone.style.width = "100%";
            myScheduleClone.style.marginBottom = "30px";
            container.appendChild(myScheduleClone);

            // Clone and add Weekly Schedule (no page break - both on same page)
            const weeklyScheduleClone = weeklyScheduleRef.current.cloneNode(true);
            weeklyScheduleClone.style.width = "100%";
            weeklyScheduleClone.style.marginTop = "10px";
            container.appendChild(weeklyScheduleClone);

            // Temporarily attach to document for rendering
            document.body.appendChild(container);

            const options = {
                margin: 0.3, // Smaller margins to fit more content
                filename: "my_schedule.pdf",
                html2canvas: {
                    scale: 1.5, // Slightly lower scale for better fit
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: "in",
                    format: "a3", // Larger format to fit both schedules
                    orientation: "portrait"
                },
            };

            console.log("Generating PDF...");
            await html2pdf().set(options).from(container).save();
            console.log("PDF generated successfully");

            // Clean up
            document.body.removeChild(container);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please check the console for details.");
        }
    };

    return (
        <button
            onClick={handleExport}
            className="px-3 py-1 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center gap-2"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
            >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9H13V5.5h-2V11H8.5l3.5 3.5 3.5-3.5z" />
            </svg>
            Download PDF
        </button>
    );
}