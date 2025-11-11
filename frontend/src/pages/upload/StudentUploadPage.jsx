import UploadBase from '../../components/upload/UploadBase';

const StudentUploadPage = () => {
  const instructions = [
    'Each student must have a unique roll number.',
    'Required fields: First Name, Last Name, Roll Number, Class, Section, Gender, Father\'s Name, Mother\'s Name, Contact Number, Monthly Fee.',
    'Email will be auto-generated in format: std[firstname][lastname]@schoolms.com (you can leave email column empty).',
    'If email is provided, it must follow the student format: std[name]@schoolms.com.',
    'Gender must be one of: male, female, other.',
    'Date fields should be in YYYY-MM-DD format.',
    'Students will be created with auto-generated passwords.',
    'Students will be automatically approved and set to active status.'
  ];

  return (
    <UploadBase
      title="Bulk Upload Students"
      description="Upload multiple student records at once using an Excel or CSV file."
      templateUrl="/api/upload/template/student"
      uploadUrl="/api/upload/students"
      instructions={instructions}
    />
  );
};

export default StudentUploadPage;
