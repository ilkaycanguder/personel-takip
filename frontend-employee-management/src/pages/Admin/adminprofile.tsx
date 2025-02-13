import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Alert,
} from "reactstrap";
import axios from "axios";
import { Employee, Role } from "../../types";
import "../../styles/index.css";

const API_BASE_URL = "https://localhost:7074/api";

const AdminProfile = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "",
  });
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false); // Modal for adding employee
  const [showEditModal, setShowEditModal] = useState(false); // Modal for editing employee
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null); // Employee ID to delete
  const [roles, setRoles] = useState<Role[]>([]); // Roles for select
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Users`);
      if (Array.isArray(response.data)) {
        const mappedEmployees = response.data.map((u) => ({
          id: u.id,
          username: u.username,
          firstname: u.firstname,
          lastname: u.lastname,
          email: u.email,
          role: u.roles.join(", "),
          password: "",
        }));
        setEmployees(mappedEmployees);
        localStorage.setItem("employees", JSON.stringify(mappedEmployees));
      } else {
        console.error("Unexpected response data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Roles`);
        if (Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          console.error("Unexpected response data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching roles", error);
      }
    };

    fetchEmployees();
    fetchRoles();
  }, []);

  const handleAddEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedRoleId === null) {
      console.error("No role selected");
      return;
    }

    try {
      const employeeToAdd = { ...newEmployee };
      const response = await axios.post(
        `${API_BASE_URL}/Users?roleId=${selectedRoleId}`,
        employeeToAdd
      );
      const addedEmployee = response.data;
      addedEmployee.roleId = selectedRoleId;
      addedEmployee.role = roles.find(
        (role) => role.id === selectedRoleId
      )?.rolename;
      setEmployees((prevEmployees) => [...prevEmployees, addedEmployee]);
      localStorage.setItem(
        "employees",
        JSON.stringify([...employees, addedEmployee])
      );
      setNewEmployee({
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        username: "",
        password: "",
      });
      setSelectedRoleId(null);
      setShowAddModal(false); // Close the add modal after adding
      // Alert'i göster
      setAlertMessage("Çalışan başarıyla eklendi!");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 5000);
    } catch (error) {
      console.error("Çalışan eklenirken bir hata oluştu:", error);
      setAlertMessage(
        "Çalışan eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      );
      setShowAddModal(false); // Close the add modal after adding

      setAlertVisible(true);
    }
  };

  const handleEditEmployee = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (editEmployee) {
      try {
        await axios.put(
          `${API_BASE_URL}/Users/${editEmployee.id}`,
          editEmployee,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        fetchEmployees();

        setEditEmployee(null);
        setShowEditModal(false); // Close the edit modal after editing

        // 5 saniye sonra vurguyu kaldır
        setTimeout(() => {}, 5000);
        setAlertMessage("Çalışan başarıyla güncellendi!");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 5000);
      } catch (error) {
        console.error("Error updating employee", error);
      }
    }
  };

  const handleDeleteEmployee = async () => {
    if (deleteEmployeeId !== null) {
      try {
        await axios.delete(`${API_BASE_URL}/Users/${deleteEmployeeId}`);
        const updatedEmployees = employees.filter(
          (employee) => employee.id !== deleteEmployeeId
        );
        setEmployees(updatedEmployees);
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
        setDeleteEmployeeId(null); // Clear delete ID
        // Optionally close the modal if using a separate state
        setAlertMessage("Çalışan başarıyla silindi!");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 5000);
      } catch (error) {
        console.error("Error deleting employee", error);
      }
    }
  };

  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = employees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  const handleAlertDismiss = () => setAlertVisible(false);

  return (
    <Container fluid>
      <Card>
        <CardBody>
          <CardTitle tag='h5' className='text-center mb-4'>
            Çalışanlar
          </CardTitle>
          {/* Success Alert */}
          {alertVisible && (
            <Alert color='success' toggle={handleAlertDismiss}>
              {alertMessage}
            </Alert>
          )}
          <Button
            color='success'
            onClick={() => setShowAddModal(true)} // Open add employee modal
            className='me-2 btn-custom btn-add'
          >
            Yeni Çalışan Ekle
          </Button>
          <Table hover responsive className='table'>
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>Adı</th>
                <th>Soyadı</th>
                <th>Email</th>
                <th>Rol</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.username}</td>
                  <td>{employee.firstname}</td>
                  <td>{employee.lastname}</td>
                  <td>{employee.email}</td>
                  <td>{employee.role}</td>
                  <td className='f-lex gap-2'>
                    <Button
                      onClick={() => {
                        setEditEmployee(employee);
                        setShowEditModal(true);
                      }}
                      className='me-2 btn-custom btn-edit'
                    >
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => {
                        setDeleteEmployeeId(employee.id);
                      }}
                      className='me-2 btn-custom btn-delete'
                    >
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination Component */}
          <div className='pagination-container'>
            <Pagination>
              <PaginationItem disabled={currentPage === 1}>
                <PaginationLink
                  previous
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index} active={index + 1 === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={currentPage === totalPages}>
                <PaginationLink
                  next
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </PaginationItem>
            </Pagination>
          </div>

          {/* Add Employee Modal */}
          <Modal
            isOpen={showAddModal}
            toggle={() => setShowAddModal(!showAddModal)}
          >
            <ModalHeader toggle={() => setShowAddModal(!showAddModal)}>
              Yeni Çalışan Ekle
            </ModalHeader>
            <Form onSubmit={handleAddEmployee}>
              <ModalBody>
                <FormGroup>
                  <Label for='username'>Kullanıcı Adı</Label>
                  <Input
                    type='text'
                    id='username'
                    placeholder='Çalışanın kullanıcı adı'
                    value={newEmployee.username}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='firstname'>Adı</Label>
                  <Input
                    type='text'
                    id='firstname'
                    placeholder='Çalışanın adı'
                    value={newEmployee.firstname}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        firstname: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='lastname'>Soyadı</Label>
                  <Input
                    type='text'
                    id='lastname'
                    placeholder='Çalışanın soyadı'
                    value={newEmployee.lastname}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        lastname: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='email'>Email</Label>
                  <Input
                    type='email'
                    id='email'
                    placeholder='Çalışanın email adresi'
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='password'>Şifre</Label>
                  <Input
                    type='password'
                    id='password'
                    placeholder='Çalışanın şifresi'
                    value={newEmployee.password}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='role'>Rol</Label>
                  <Input
                    type='select'
                    id='role'
                    value={selectedRoleId || ""}
                    onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                    required
                  >
                    <option value=''>Rol Seçin</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.rolename}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </ModalBody>
              <ModalFooter className='modal-footer-custom'>
                <Button color='primary' type='submit'>
                  Ekle
                </Button>{" "}
                <Button color='danger' onClick={() => setShowAddModal(false)}>
                  İptal
                </Button>
              </ModalFooter>
            </Form>
          </Modal>

          {/* Edit Employee Modal */}
          <Modal
            isOpen={showEditModal}
            toggle={() => setShowEditModal(!showEditModal)}
          >
            <ModalHeader toggle={() => setShowEditModal(!showEditModal)}>
              Çalışanı Düzenle
            </ModalHeader>
            <Form onSubmit={handleEditEmployee}>
              <ModalBody>
                {editEmployee && (
                  <>
                    <FormGroup>
                      <Label for='username'>Kullanıcı Adı</Label>
                      <Input
                        type='text'
                        id='username'
                        value={editEmployee.username}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='firstname'>Adı</Label>
                      <Input
                        type='text'
                        id='firstname'
                        value={editEmployee.firstname}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            firstname: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='lastname'>Soyadı</Label>
                      <Input
                        type='text'
                        id='lastname'
                        value={editEmployee.lastname}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            lastname: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='email'>Email</Label>
                      <Input
                        type='email'
                        id='email'
                        value={editEmployee.email}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='password'>Parola</Label>
                      <Input
                        type='password'
                        id='passwordl'
                        value={editEmployee.password}
                        placeholder='********'
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            password: e.target.value,
                          })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='role'>Rol</Label>
                      <Input
                        type='select'
                        id='role'
                        value={editEmployee.role || ""}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value=''>Rol Seçin</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.rolename}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </>
                )}
              </ModalBody>
              <ModalFooter className='modal-footer-custom'>
                <Button color='primary' type='submit'>
                  Onayla
                </Button>{" "}
                <Button color='danger' onClick={() => setShowEditModal(false)}>
                  Kapat
                </Button>
              </ModalFooter>
            </Form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={deleteEmployeeId !== null}
            toggle={() => setDeleteEmployeeId(null)}
          >
            <ModalHeader toggle={() => setDeleteEmployeeId(null)}>
              Çalışanı Sil
            </ModalHeader>
            <ModalBody>
              Seçilen çalışanı silmek istediğinizden emin misiniz?
            </ModalBody>
            <ModalFooter className='modal-footer-custom'>
              <Button color='primary' onClick={handleDeleteEmployee}>
                Sil
              </Button>{" "}
              <Button color='danger' onClick={() => setDeleteEmployeeId(null)}>
                İptal
              </Button>
            </ModalFooter>
          </Modal>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AdminProfile;
