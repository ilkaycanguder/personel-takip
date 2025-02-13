import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  FormFeedback,
} from "reactstrap";
import { loginUser } from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import "../styles/loginstyles.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false); // Parola hata durumu
  const [passwordFeedback, setPasswordFeedback] = useState(""); // Parola hata mesajı
  const navigate = useNavigate();
  useAuth();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        const userRole = parsedToken?.role;

        if (userRole) {
          navigate("/" + userRole.toLocaleLowerCase());
        }
      } catch (error) {
        console.error("Error parsing authToken from localStorage", error);
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(false); // Hata durumunu sıfırla
    setPasswordFeedback(""); // Hata mesajını sıfırla
    try {
      const response = await loginUser(email, password);
      console.log("Giriş yanıtı:", response); // Yanıtı kontrol edin

      if (response && response.message === "Giriş başarılı" && response.user) {
        if (response.user.id === undefined) {
          throw new Error("Kullanıcı ID'si mevcut değil.");
        }

        const token = response.token; // Token'ı dönen yanıttan al
        localStorage.setItem("authToken", JSON.stringify({ token }));
        localStorage.setItem("user", JSON.stringify(response.user));
        const role = response.user.role;
        if (role === "Admin") {
          navigate("/admin"); // Admin paneline yönlendir
        } else if (role === "Employee") {
          navigate("/employee"); // Kullanıcı paneline yönlendir
        }
      } else {
        throw new Error("Yanıt formatı beklenmedik.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || error.message;
        setPasswordError(true);
        setPasswordFeedback(`Giriş sırasında hata oluştu: ${errorMessage}`);
        toast.error(`Giriş sırasında hata oluştu: ${errorMessage}`);
      } else {
        setPasswordError(true);
        setPasswordFeedback(`Giriş sırasında beklenmedik bir hata oluştu.`);
        toast.error("Giriş sırasında beklenmedik bir hata oluştu.");
      }
      throw error;
    }
  };

  return (
    <div className='login-container'>
      <Card className='card-custom'>
        <CardBody>
          <CardTitle tag='h5' className='text-center'>
            Login
          </CardTitle>
          <Form onSubmit={handleLogin}>
            <FormGroup className='input-container'>
              <Label for='email'>
                {" "}
                <FontAwesomeIcon className='fa' icon={faEnvelope} /> Email
              </Label>
              <Input
                type='email'
                name='email'
                id='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='input-custom'
              />
            </FormGroup>
            <FormGroup className='input-container'>
              <Label for='password'>
                <FontAwesomeIcon className='fa' icon={faLock} /> Password
              </Label>
              <Input
                type='password'
                name='password'
                id='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={passwordError}
                className='input-custom'
              />
              {passwordError && (
                <FormFeedback className='form-feedback'>
                  {passwordFeedback}
                </FormFeedback>
              )}
            </FormGroup>
            <Button type='submit' className='btnLogin' color='primary' block>
              Login
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
