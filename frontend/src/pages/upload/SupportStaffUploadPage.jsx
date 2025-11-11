import UploadBase from '../../components/upload/UploadBase';

const SupportStaffUploadPage = () => {
  const instructions = [
    'Each support staff must have a unique email address and employee ID.',
    'Required fields: First Name, Last Name, Email, Employee ID, Phone Number, Position, Experience, Gender, Salary.',
    'Gender must be one of: male, female, other.',
    'Position must be one of: janitor, security, gardener, driver, cleaner, cook, other.',
    'Working hours: Start Time and End Time should be in HH:MM format.',
    'Days of Week should be comma-separated (e.g., "Monday,Tuesday,Wednesday").',
    'Date fields should be in YYYY-MM-DD format.',
    'Support staff will be created with auto-generated passwords.',
    'Support staff will be automatically approved and set to active status.'
  ];

  return (
    <UploadBase
      title="Bulk Upload Support Staff"
      description="Upload multiple support staff records at once using an Excel or CSV file."
      templateUrl="/api/upload/template/support-staff"
      uploadUrl="/api/upload/support-staff"
      instructions={instructions}
    />
  );
};

export default SupportStaffUploadPage;
