import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import type { NextPage, GetServerSideProps } from "next";
import type { AllUsersViewProps, MongoDBUser } from "../../types";

import useStateContext from "../../hooks/useStateContext";

import Sidebar from "../../components/Sidebar";
const SearchBar = dynamic(() => import("../../components/SearchBar"));
const UserList = dynamic(() => import("../../components/UserList"));
const UserView = dynamic(() => import("../../components/UserView"));

const AllUsersView: NextPage<AllUsersViewProps> = ({ users }) => {
  const { searchTerm } = useStateContext();
  const [reactiveUsers, setReactiveUsers] = useState<MongoDBUser[]>(users);
  const [showUserInfo, setShowUserInfo] = useState<boolean>(false);
  const [usersLimit, setUsersLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<MongoDBUser | null>(null);

  const handleSearch = () => {
    if (!searchTerm) return setReactiveUsers(users);

    const searchedUsers = users.filter(user => user?.username.toLowerCase().includes(searchTerm.toLowerCase()));
    setReactiveUsers(searchedUsers);
  };

  useEffect(() => {
    const fetchMoreUsers = async () => {
      setLoading(true);
      const { fetchUsers } = await import("../../api");

      const { data: users } = await fetchUsers(usersLimit);
      setReactiveUsers(users);
      setLoading(false);
    };

    fetchMoreUsers();
  }, [usersLimit]);

  return (
    <article className="flex dark:bg-dark-gray dark:text-white">
      <Sidebar
        route="users"
        scrollingOptions={{
          loading,
          setLimit: setUsersLimit,
        }}
      />
      <div className="w-[82%]">
        <SearchBar onSearch={handleSearch} noBorder />
        <UserList users={reactiveUsers} itemClick={{ changeShowingUserInfo: () => setShowUserInfo(true), setSelectedUser }} />
      </div>
      {showUserInfo && <UserView user={selectedUser} closeMenu={() => setShowUserInfo(false)} />}
    </article>
  );
};

export const getServerSideProps: GetServerSideProps<AllUsersViewProps> = async () => {
  const { fetchUsers } = await import("../../api");
  const { data: users } = await fetchUsers(10);

  return {
    props: { users },
  };
};

export default AllUsersView;
