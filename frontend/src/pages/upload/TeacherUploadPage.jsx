import UploadBase from '../../components/upload/UploadBase';

const TeacherUploadPage = () => {
  const instructions = [
    'Teacher emails and employee IDs are automatically generated - you do not need to provide them.',
    'Required fields: First Name, Last Name, Phone Number, Qualification, Experience, Subjects, Gender, Salary.',
    'Email will be generated in the format: tch[firstname][lastname]@schoolms.com',
    'Gender must be one of: male, female, other.',
    'Subjects should be comma-separated (e.g., "Mathematics,Physics,Chemistry").',
    'Classes should be comma-separated (e.g., "9,10,11").',
    'Date fields should be in YYYY-MM-DD format.',
    'Teachers will be created with auto-generated passwords.',
    'Teachers will be automatically approved and set to active status.'
  ];

  return (
    <UploadBase
      title="Bulk Upload Teachers"
      description="Upload multiple teacher records at once using an Excel or CSV file."
      templateUrl="/api/upload/template/teacher"
      uploadUrl="/api/upload/teachers"
      instructions={instructions}
    />
  );
};

export default TeacherUploadPage;
