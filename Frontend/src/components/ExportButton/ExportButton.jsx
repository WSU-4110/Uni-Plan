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
            container.style.width = "11in"; // better page fit for landscape
            container.style.maxWidth = "none";
            container.style.fontFamily = "Arial, sans-serif";
            container.style.fontSize = "13px"; // slightly larger for readability
            container.style.boxSizing = "border-box";

            // scaling wrappers to ensure content fits on page
            const scaleWrapper = document.createElement("div");
            scaleWrapper.style.transform = "scale(0.75)"; // smaller element size for PDF fit
            scaleWrapper.style.transformOrigin = "top left";
            scaleWrapper.style.width = "100%";
            scaleWrapper.style.margin = "0 auto";

            // Clone and add My Schedule
            const myScheduleClone = myScheduleRef.current.cloneNode(true);
            myScheduleClone.style.width = "100%";
            myScheduleClone.style.marginBottom = "30px";

            // Clone and add Weekly Schedule (no page break - both on same page)
            const weeklyScheduleClone = weeklyScheduleRef.current.cloneNode(true);
            weeklyScheduleClone.style.width = "100%";
            weeklyScheduleClone.style.marginTop = "10px";

            scaleWrapper.appendChild(myScheduleClone);
            scaleWrapper.appendChild(weeklyScheduleClone);
            container.appendChild(scaleWrapper);

            // Temporarily attach to document for rendering
            document.body.appendChild(container);

            //PDF options - adjusted for better fit and quality
            const options = {
                margin: 0.3, // Smaller margins to fit more content
                filename: "my_schedule.pdf",
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: "in",
                    format: "letter",
                    orientation: "landscape" // wider page
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