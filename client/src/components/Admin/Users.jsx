import { useEffect, useState } from "react";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { Heading, Flex } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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
        <Heading fontWeight="normal" fontSize="2xl" color="gray.600">
          Loading ...
        </Heading>
      </Flex>
    );
  }

  return (
    <Flex w="full" h="full" direction="column">
      <Heading fontWeight="normal" fontSize="2xl" mb={5} color="primary">
        Users List
      </Heading>

      {users && users.length ? (
        <Table minW="700px" size="md" colorScheme="gray">
          <Thead>
            <Th>Name</Th>
            <Th>email</Th>
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
                  <Td>{user.role}</Td>
                  <Td>{user.referer ? user.referer.name : "None"}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <Heading color="gray" fontSize="sm" fontWeight="normal">
          No users available yet :(
        </Heading>
      )}
    </Flex>
  );
};

export default Users;
