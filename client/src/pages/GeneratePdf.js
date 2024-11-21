import { jsPDF } from 'jspdf';

const generatePDF = async ({ logAnalysisData, fileAnalysisData, networkAnalysisData }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();

      // Title for the PDF
      doc.setFontSize(18);
      doc.text('Analysis Report', 20, 20);

      // Summary Section
      doc.setFontSize(14);
      doc.text('Summary:', 20, 30);

      let summaryY = 40;
      let safeLogsCount = logAnalysisData?.safe_logs?.length || 0;
      let suspiciousLogsCount = logAnalysisData?.suspicious_logs?.length || 0;
      let filesAnalyzedCount = fileAnalysisData?.length || 0;
      let networkFindingsCount = networkAnalysisData?.length || 0;

      doc.text(`Safe Logs: ${safeLogsCount}`, 20, summaryY);
      summaryY += 10;
      doc.text(`Suspicious Logs: ${suspiciousLogsCount}`, 20, summaryY);
      summaryY += 10;
      doc.text(`Files Analyzed: ${filesAnalyzedCount}`, 20, summaryY);
      summaryY += 10;
      doc.text(`Network Findings: ${networkFindingsCount}`, 20, summaryY);
      summaryY += 20; // Add extra space after summary

      let currentY = summaryY;

      // Log Analysis Results
      if (logAnalysisData) {
        doc.setFontSize(14);
        doc.text('Log Analysis Results:', 20, currentY);
        currentY += 10;

        // Safe Logs
        if (logAnalysisData.safe_logs && logAnalysisData.safe_logs.length > 0) {
          doc.text('Safe Logs:', 20, currentY);
          logAnalysisData.safe_logs.forEach((log, index) => {
            currentY += 10;
            doc.text(`${index + 1}. ${log}`, 20, currentY);
          });
        } else {
          doc.text('No safe logs found.', 20, currentY);
          currentY += 10;
        }

        // Suspicious Logs
        if (logAnalysisData.suspicious_logs && logAnalysisData.suspicious_logs.length > 0) {
          currentY += 10;
          doc.text('Suspicious Logs:', 20, currentY);
          logAnalysisData.suspicious_logs.forEach((log, index) => {
            currentY += 10;
            doc.text(`${index + 1}. ${log}`, 20, currentY);
          });
        } else {
          doc.text('No suspicious logs found.', 20, currentY);
          currentY += 10;
        }
      } else {
        doc.text('No log analysis data available.', 20, currentY);
        currentY += 20;
      }

      // File Analysis Results
      if (fileAnalysisData) {
        currentY += 10;
        doc.setFontSize(14);
        doc.text('File Analysis Results:', 20, currentY);
        currentY += 10;

        fileAnalysisData.forEach((file, index) => {
          doc.text(`File Name: ${file.name}`, 20, currentY);
          currentY += 10;
          doc.text(`File Type: ${file.fileType}`, 20, currentY);
          currentY += 10;
          doc.text(`MD5 Hash: ${file.md5Hash}`, 20, currentY);
          currentY += 10;
          doc.text(`SHA1 Hash: ${file.sha1Hash}`, 20, currentY);
          currentY += 10;
          doc.text(`SHA256 Hash: ${file.sha256Hash}`, 20, currentY);
          currentY += 10;
        });
      } else {
        doc.text('No file analysis data available.', 20, currentY);
        currentY += 20;
      }

      // Network Analysis Results
      if (networkAnalysisData) {
        currentY += 10;
        doc.setFontSize(14);
        doc.text('Network Analysis Results:', 20, currentY);
        currentY += 10;

        networkAnalysisData.forEach((result, index) => {
          doc.text(`${index + 1}. ${result}`, 20, currentY);
          currentY += 10;
        });
      } else {
        doc.text('No network analysis data available.', 20, currentY);
        currentY += 20;
      }

      // Footer
      doc.setFontSize(10);
      doc.text('Generated by Obsidian Circuit', 20, 280); // Positioned at the bottom

      // Save the generated PDF
      doc.save('analysis_report.pdf');
      resolve('PDF generated successfully!');
    } catch (error) {
      reject(`Error generating PDF: ${error.message}`);
    }
  });
};

export default generatePDF;
