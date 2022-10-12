import Swal from 'sweetalert2';
export default Swal.mixin({
    customClass: {
      confirmButton: "btn-primary mx-1 px-2 w-fit",
      cancelButton: "btn-bg mx-1 px-2 w-fit",
      title: "text-text",
      htmlContainer: "text-text",
    },
    buttonsStyling: false,
    background: "#f9f9f9"
  });