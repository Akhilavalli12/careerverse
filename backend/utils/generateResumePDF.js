const PDFDocument = require('pdfkit');

// Generates a resume PDF from student profile data and pipes it to the given writable stream (e.g. res)
const generateResumePDF = (student, res) => {
  const doc = new PDFDocument({ margin: 50 });
  const user = student.user || {};

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${(user.name || 'resume').replace(/\s+/g, '_')}_resume.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(22).font('Helvetica-Bold').text(user.name || 'Untitled', { align: 'left' });
  if (student.headline) {
    doc.fontSize(12).font('Helvetica').fillColor('#3b6fe0').text(student.headline);
  }
  doc.fillColor('#000000');
  const contactLine = [user.email, student.location, student.linkedinUrl].filter(Boolean).join('  |  ');
  if (contactLine) doc.fontSize(10).fillColor('#555555').text(contactLine);
  doc.moveDown(1);
  doc.fillColor('#000000');

  const sectionHeading = (title) => {
    doc.moveDown(0.5);
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#3b6fe0').text(title.toUpperCase());
    doc.fillColor('#000000');
    doc.moveDown(0.2);
    doc.moveTo(doc.x, doc.y).lineTo(560, doc.y).strokeColor('#dddddd').stroke();
    doc.moveDown(0.3);
  };

  // Summary
  const summary = student.resumeBuilderData?.summary || student.bio;
  if (summary) {
    sectionHeading('Summary');
    doc.fontSize(10).font('Helvetica').text(summary);
  }

  // Skills
  if (student.skills?.length) {
    sectionHeading('Skills');
    doc.fontSize(10).font('Helvetica').text(student.skills.join('  •  '));
  }

  // Experience
  if (student.experience?.length) {
    sectionHeading('Experience');
    student.experience.forEach((exp) => {
      doc.fontSize(11).font('Helvetica-Bold').text(`${exp.title || ''}${exp.company ? ' — ' + exp.company : ''}`);
      const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate]
        .filter(Boolean)
        .map((d) => (d instanceof Date ? d.toDateString() : d))
        .join(' – ');
      if (dates) doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666').text(dates);
      doc.fillColor('#000000');
      if (exp.description) doc.fontSize(10).font('Helvetica').text(exp.description);
      doc.moveDown(0.4);
    });
  }

  // Education
  if (student.education?.length) {
    sectionHeading('Education');
    student.education.forEach((ed) => {
      doc.fontSize(11).font('Helvetica-Bold').text(`${ed.degree || ''}${ed.fieldOfStudy ? ' in ' + ed.fieldOfStudy : ''}`);
      doc.fontSize(10).font('Helvetica').text(`${ed.institution || ''}${ed.startYear ? `  (${ed.startYear}–${ed.endYear || 'Present'})` : ''}`);
      if (ed.grade) doc.fontSize(9).fillColor('#666666').text(`Grade: ${ed.grade}`);
      doc.fillColor('#000000');
      doc.moveDown(0.4);
    });
  }

  // Projects
  if (student.projects?.length) {
    sectionHeading('Projects');
    student.projects.forEach((p) => {
      doc.fontSize(11).font('Helvetica-Bold').text(p.title || '');
      if (p.description) doc.fontSize(10).font('Helvetica').text(p.description);
      if (p.githubUrl) doc.fontSize(9).fillColor('#3b6fe0').text(p.githubUrl);
      doc.fillColor('#000000');
      doc.moveDown(0.4);
    });
  }

  // Certificates
  if (student.certificates?.length) {
    sectionHeading('Certificates');
    student.certificates.forEach((c) => {
      doc.fontSize(10).font('Helvetica').text(`${c.title}${c.issuedBy ? ' — ' + c.issuedBy : ''}`);
    });
  }

  // Custom sections
  if (student.resumeBuilderData?.customSections?.length) {
    student.resumeBuilderData.customSections.forEach((section) => {
      sectionHeading(section.heading || 'Additional');
      doc.fontSize(10).font('Helvetica').text((section.items || []).join('\n'));
    });
  }

  doc.end();
};

module.exports = { generateResumePDF };
