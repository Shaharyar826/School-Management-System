import { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, height = 300 }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (editorRef.current && editorRef.current.editor) {
        editorRef.current.editor.destroy();
      }
    };
  }, []);

  return (
    <Editor
      // OPTION 1: WITH API KEY (CLOUD VERSION)
      // Using TinyMCE Cloud version with API key
      // This provides additional features and CDN-hosted resources
      apiKey="pza3mwf2h0f7n73sfbp14afbmbmq1lszw7jcfesik41tyy8f"

      // OPTION 2: WITHOUT API KEY (SELF-HOSTED VERSION)
      // To use without an API key:
      // 1. Comment out the apiKey line above
      // 2. Uncomment the line below
      // This will use the self-hosted version included in the package
      // apiKey={null}

      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        branding: false,
        promotion: false
      }}
    />
  );
};

export default RichTextEditor;
