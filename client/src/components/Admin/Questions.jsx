import { IconButton } from "@chakra-ui/button";
import { Flex, Heading, Stack } from "@chakra-ui/layout";
import { Badge } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { MdDeleteOutline } from "react-icons/md";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";

const Questions = () => {
  const [category, setCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const toast = useToast();
  const history = useHistory();
  const { categoryId } = useParams();

  // for fetching all the questions
  async function fetchQuestions(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/category/${categoryId}/questions`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        setQuestions(body.questions || []);
        setCategory(body.category);
        setLoading(false);
      } else {
        history.replace("/admin");
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "We have an error" });
    }
  }

  // for deleting a specific question
  async function deleteQuestion(questionId) {
    const confirmed = window.confirm("Are you sure? You want to delete this question?");
    if (confirmed) {
      try {
        const res = await fetch(
          `${config.serverURL}/get_admin/question/${questionId}/${categoryId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const body = await res.json();

        if (res.ok) {
          setQuestions(body.questions);
          toast({ status: "success", description: body.msg });
        } else {
          toast({ status: "error", description: body.msg || "We are having a server side error" });
        }
      } catch (err) {
        toast({ status: "error", description: err.message || "We have an error" });
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    fetchQuestions(abortController);

    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  } else {
    return (
      <div>
        <Heading fontWeight="normal" fontSize="2xl" color="primary" mb={5}>
          Questions in: "{category.name}"
        </Heading>
        <Flex direction="column">
          {questions && questions.length > 0 ? (
            <Table size="md" minW="800px">
              <Thead>
                <Th>Question</Th>
                <Th>Options</Th>
                <Th>Answer</Th>
                <Th>Actions</Th>
              </Thead>
              <Tbody>
                {questions.map(({ question, answer, options, _id }, index) => {
                  return (
                    <Tr key={index}>
                      <Td>{question}</Td>
                      <Td>
                        <Stack
                          direction="row"
                          wrap="wrap"
                          display="flex"
                          gridGap={2}
                          justify="flex-start"
                          align="flex-start"
                        >
                          {options.map((option) => (
                            <Badge textTransform="none" colorScheme="purple" variant="subtle">
                              {option}
                            </Badge>
                          ))}
                        </Stack>
                      </Td>
                      <Td>{answer}</Td>
                      <Td>
                        <IconButton
                          onClick={() => deleteQuestion(_id)}
                          icon={<MdDeleteOutline />}
                          colorScheme="red"
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <Heading fontSize="1xl" color="gray.500" fontWeight="normal">
              No Questions found in this category
            </Heading>
          )}
        </Flex>
      </div>
    );
  }
};

export default Questions;
