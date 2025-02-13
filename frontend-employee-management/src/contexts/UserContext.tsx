import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from "react";

const API_BASE_URL = "https://localhost:7074/api";

const UserContext = createContext<
  | {
      userId: number | null;
      role: string | null;
      username: string | null;
      jobs: any[];
    }
  | undefined
>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Users`);
        if (!response.ok) {
          throw new Error("Kullanıcı bilgileri alınırken bir hata oluştu");
        }
        const userInfo = await response.json();
        setUserId(userInfo.id); // ID'yi ayarlıyoruz
        setRole(userInfo.role); // Rolü ayarlıyoruz
        setUsername(userInfo.username);
      } catch (error) {
        console.error("Kullanıcı bilgileri alınırken bir hata oluştu:", error);
      }
    };

    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Jobs/all`);
        if (!response.ok) {
          throw new Error("İş bilgileri alınırken bir hata oluştu");
        }
        const jobsData = await response.json();
        setJobs(jobsData); // İş bilgilerini ayarlıyoruz
      } catch (error) {
        console.error("İş bilgileri alınırken bir hata oluştu:", error);
      }
    };

    fetchUserInfo();
    fetchJobs(); // İş bilgilerini alıyoruz
  }, []);

  return (
    <UserContext.Provider value={{ userId, role, username, jobs }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
