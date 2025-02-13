import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/index.css";

interface LayoutProps {
  isAdmin: boolean;
}

const Layout = ({ isAdmin }: LayoutProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen);
  const toggleLogoutModal = () => setShowLogoutModal(!showLogoutModal);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userItem = localStorage.getItem("user");
    const userRole = userItem ? JSON.parse(userItem)?.role : null;

    if (
      userRole &&
      !location.pathname.includes("/" + userRole.toLocaleLowerCase())
    ) {
      navigate("/" + userRole.toLocaleLowerCase());
    }
    const modalShown = localStorage.getItem("modalShown");
    if (!modalShown) {
      setModalOpen(true);
      localStorage.setItem("modalShown", "true");
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && modalOpen) {
        toggleModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("jobs");
    localStorage.removeItem("user");
    localStorage.removeItem("employees");
    localStorage.removeItem("modalShown");
    navigate("/");
  };

  useEffect(() => {
    if (modalOpen || showLogoutModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalOpen, showLogoutModal]);

  return (
    <div className='layout-container'>
      <Navbar dark expand='md' className='navbar-custom shadow'>
        <Container fluid className='d-flex align-items-center'>
          <NavbarToggler onClick={toggleNavbar} />
          <div
            className={`collapse navbar-collapse ${isNavbarOpen ? "show" : ""}`}
          >
            <Nav className='me-auto'>
              <NavItem>
                <NavLink
                  className='navbar-brand-custom text-white'
                  tag={Link}
                  to='/admin'
                >
                  Personel Takip
                </NavLink>
              </NavItem>
              {isAdmin ? (
                <>
                  <NavItem>
                    <NavLink
                      tag={Link}
                      to='/admin/profile'
                      className='nav-link-custom text-white'
                    >
                      Profil
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      tag={Link}
                      to='/admin/job-tracking'
                      className='nav-link-custom text-white'
                    >
                      İş Takip
                    </NavLink>
                  </NavItem>
                </>
              ) : (
                <>
                  <NavItem>
                    <NavLink
                      tag={Link}
                      to='profile'
                      className='nav-link-custom text-white'
                    >
                      Profil
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      tag={Link}
                      to='job-tracking'
                      className='nav-link-custom text-white'
                    >
                      İş Takip
                    </NavLink>
                  </NavItem>
                </>
              )}
              <NavItem>
                <NavLink
                  href='#'
                  className='nav-link-custom text-white'
                  onClick={toggleLogoutModal}
                >
                  Çıkış
                </NavLink>
              </NavItem>
            </Nav>
          </div>
        </Container>
      </Navbar>
      <div className='main-content py-4'>
        <Outlet /> {/* Main content rendered here */}
      </div>

      {/* Popup Modal */}

      <Modal isOpen={modalOpen} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>Hoşgeldiniz!</ModalHeader>
        <ModalBody>
          Personel takip sistemimize giriş yaptınız. Menüden gerekli işlemleri
          yapabilirsiniz.
        </ModalBody>
        <ModalFooter className='modal-footer-custom'>
          <Button color='secondary' onClick={toggleModal}>
            Başla
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showLogoutModal} toggle={toggleLogoutModal} centered>
        <ModalHeader toggle={toggleLogoutModal}>Çıkış Yapma Onayı</ModalHeader>
        <ModalBody>Çıkış yapmak istediğinizden emin misiniz?</ModalBody>
        <ModalFooter className='modal-footer-custom'>
          <Button color='success' onClick={handleLogout}>
            Evet
          </Button>
          <Button color='danger' onClick={toggleLogoutModal}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Layout;
