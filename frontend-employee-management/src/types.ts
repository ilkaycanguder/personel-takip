export interface Employee {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  password: string;
}

export interface Role {
  id: number;
  rolename: string;
}

export interface LoginResponse {
  message: string;
  role: string;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    password: number;
    firstname: string;
    lastname: string;
    role: string;
  };
  jobs: {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    assignedTo: number;
    createdby: number;
    createdat: Date;
    updatedat: Date;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  password?: string;
  firstname: string;
  lastname: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  category: string;
  assignedto: number;
  createdby: number;
  createdat: Date;
  updatedat: Date;
}

export interface Jobupdate {
  id: number;
  jobid: number;
  updatetype: string;
  comment: string;
  updatedby: number;
  updatedat: Date;
}
