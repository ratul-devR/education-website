import { Heading, Flex } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import config from "../../config";
import useToast from "../../hooks/useToast";

import NoMessage from "../global/NoMessage";

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  async function fetchOrgs(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/organizations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        setOrgs(body.organizations);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchOrgs(abortController);
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
        Organization List
      </Heading>

      {orgs && orgs.length > 0 ? (
        <Table minW="700px" size="md" colorScheme="gray">
          <Thead>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Total refers</Th>
          </Thead>
          <Tbody>
            {/* showing up all the categories */}
            {orgs.map((org) => {
              return (
                <Tr key={org._id}>
                  <Td>{org.name}</Td>
                  <Td>{org.phone}</Td>
                  <Td>{org.email}</Td>
                  <Td>{org.refers.length}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <NoMessage message="No Organizations Found" />
      )}
    </Flex>
  );
};

export default Organizations;
