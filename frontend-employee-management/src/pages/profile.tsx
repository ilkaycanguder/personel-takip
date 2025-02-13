import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  InputGroup,
  InputGroupText,
  FormFeedback,
  Alert,
} from "reactstrap";
import { FaKey, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/index.css";

const API_BASE_URL = "https://localhost:7074/api";

const Profile: React.FC = () => {
  const [user, setUser] = useState<{
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string;
  } | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [oldPasswordFeedback, setOldPasswordFeedback] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const user = localStorage.getItem("user");
        const token = storedToken ? JSON.parse(storedToken)?.token : null;
        const userData = user ? JSON.parse(user) : null;
        const userId = userData ? userData.id : null;

        if (!token) throw new Error("Token bulunamadı");
        if (!userId) throw new Error("Kullanıcı ID bulunamadı");

        const response = await fetch(
          `${API_BASE_URL}/Users/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error("Kullanıcı bilgileri alınırken bir hata oluştu");

        const userInfo = await response.json();
        setUser({
          username: userInfo.username,
          firstname: userInfo.firstname,
          lastname: userInfo.lastname,
          email: userInfo.email,
          roles: userInfo.roles,
        });
      } catch (error) {
        console.error("Kullanıcı bilgileri alınırken bir hata oluştu:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handlePasswordChange = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setOldPasswordError(false);
    setOldPasswordFeedback("");
    setAlertVisible(false);

    try {
      const storedToken = localStorage.getItem("authToken");
      const token = storedToken ? JSON.parse(storedToken)?.token : null;

      if (!token) throw new Error("Token bulunamadı.");

      const response = await fetch(`${API_BASE_URL}/Profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Oldpasswordhash: oldPassword,
          Newpasswordhash: newPassword,
        }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        const errorJson = JSON.parse(responseText);
        if (errorJson.message.includes("Eski şifre yanlış")) {
          setOldPasswordError(true);
          setOldPasswordFeedback("Eski şifre yanlış.");
          toast.error("Eski şifre yanlış.");
        } else {
          throw new Error(
            errorJson.message || "Şifre güncellenirken bir hata oluştu"
          );
        }
      } else {
        setAlertMessage("Şifre başarıyla güncellendi");
        setAlertVisible(true);
        setOldPassword("");
        setNewPassword("");
        setTimeout(() => {
          setAlertVisible(false);
        }, 5000);
      }
    } catch (error) {
      setOldPasswordError(true);
      setOldPasswordFeedback(
        error instanceof Error
          ? error.message
          : "Şifre güncellenirken beklenmedik bir hata oluştu."
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Şifre güncellenirken beklenmedik bir hata oluştu."
      );
    }
  };

  return (
    <Container className='mt-4'>
      <Card
        className='card-custom shadow-lg mx-auto'
        style={{ maxWidth: "500px" }}
      >
        <CardBody className='p-4'>
          <CardTitle tag='h5' className='text-center mb-4 font-weight-bold'>
            Şifre Güncelleme
          </CardTitle>

          <div className='user-info'>
            <div className='info-item'>
              <strong>Kullanıcı Adı:</strong>
              <span>{user?.username || "Yükleniyor..."}</span>
            </div>
            <div className='info-item'>
              <strong>Adı:</strong>
              <span>{user?.firstname || "Yükleniyor..."}</span>
            </div>
            <div className='info-item'>
              <strong>Soyadı:</strong>
              <span>{user?.lastname || "Yükleniyor..."}</span>
            </div>
            <div className='info-item'>
              <strong>Email:</strong>
              <span>{user?.email || "Yükleniyor..."}</span>
            </div>
            <div className='info-item'>
              <strong>Rol:</strong>
              <span>{user?.roles || "Yükleniyor..."}</span>
            </div>
          </div>

          <Form onSubmit={handlePasswordChange}>
            <FormGroup>
              <Label for='oldPassword'>Eski Şifre</Label>
              <InputGroup className='mb-3'>
                <InputGroupText className='bg-light border-0'>
                  <FaKey />
                </InputGroupText>
                <Input
                  type='password'
                  id='oldPassword'
                  placeholder='Eski şifrenizi giriniz'
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  invalid={oldPasswordError}
                  className='rounded-start'
                  required
                />
                <FormFeedback>{oldPasswordFeedback}</FormFeedback>
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <Label for='newPassword'>Yeni Şifre</Label>
              <InputGroup className='mb-3'>
                <InputGroupText className='bg-light border-0'>
                  <FaShieldAlt />
                </InputGroupText>
                <Input
                  type='password'
                  id='newPassword'
                  placeholder='Yeni şifrenizi giriniz'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='rounded-start'
                  required
                />
              </InputGroup>
            </FormGroup>

            <Button
              color='primary'
              block
              type='submit'
              className='btn-custom mt-4 mb-2'
              style={{ borderRadius: "25px", padding: "10px 20px" }}
            >
              Şifreyi Güncelle
            </Button>
            {alertVisible && (
              <Alert
                color='success'
                toggle={() => setAlertVisible(false)}
                fade={true}
              >
                {alertMessage}
              </Alert>
            )}
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Profile;
