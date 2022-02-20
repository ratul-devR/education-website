import { useEffect, useState } from "react";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { Heading, Flex, Tooltip, Text } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td, Tfoot } from "@chakra-ui/table";
import { Spinner } from "@chakra-ui/spinner";
import { IconButton } from "@chakra-ui/button";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

import NoMessage from "../global/NoMessage";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(30);
  const toast = useToast();

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (number) => number >= 1 && number <= totalPages && setCurrentPage(number);

  // for fetching all the users
  async function fetchUsers(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        setUsers(body.users);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg || "We are having server side issues" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers(abortController);
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" direction="column" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex w="full" h="full" direction="column">
      <Heading fontWeight="normal" fontSize="2xl" mb={5} color="primary">
        Users List
      </Heading>

      {currentUsers && currentUsers.length ? (
        <Table minW="900px" size="md" colorScheme="gray">
          <Thead>
            <Th>Name</Th>
            <Th>email</Th>
            <Th>phone</Th>
            <Th>role</Th>
            <Th>Referred by</Th>
          </Thead>
          <Tbody>
            {/* showing up all the categories */}
            {users.map((user) => {
              return (
                <Tr key={user._id}>
                  <Td>
                    {user.firstName} {user.lastName}
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>{user.phone ? user.phone : "Not provided"}</Td>
                  <Td>{user.role}</Td>
                  <Td>
                    {user.referer ? (
                      <Tooltip closeDelay={1500} hasArrow label={`Id: ${user.referer._id}`}>
                        {user.referer.name}
                      </Tooltip>
                    ) : (
                      "None"
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Td colSpan={2}>
                <Text color="GrayText">
                  ({currentPage} / {totalPages}) pages
                </Text>
              </Td>
              <Td colSpan={2}>
                <IconButton
                  onClick={() => paginate(currentPage - 1)}
                  colorScheme="blue"
                  mr={3}
                  icon={<AiOutlineLeft />}
                />
                <IconButton
                  onClick={() => paginate(currentPage + 1)}
                  colorScheme="blue"
                  icon={<AiOutlineRight />}
                />
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      ) : (
        <NoMessage message="No Users Found" />
      )}
    </Flex>
  );
};

export default Users;
