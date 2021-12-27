import { IconButton } from "@chakra-ui/button";
import { Flex, Heading, Stack } from "@chakra-ui/layout";
import { Badge } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { MdDeleteOutline } from "react-icons/md";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { Table, Thead, Tbody, Tr, Th, Td, Tfoot } from "@chakra-ui/table";

import AddQuestionCsvModal from "./components/AddQuestionCsvModal";
import NoMessage from "../global/NoMessage";
import EditQuestionModal from "./components/EditQuestionModal";

const Questions = () => {
  const [category, setCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(20);
  const toast = useToast();
  const history = useHistory();
  const { categoryId } = useParams();

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const paginate = (number) => number >= 1 && number <= totalPages && setCurrentPage(number);

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
          setQuestions((pre) => pre.filter((question) => question._id !== body.question._id));
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
        <Heading fontWeight="normal" fontSize="2xl" color="primary" mb={10}>
          Questions in: "{category.name}"
        </Heading>
        {/* the modal for uploading questions using csv file to the current category */}
        <AddQuestionCsvModal category={category} setQuestions={setQuestions} />
        {/* the table containing all the questions */}
        <Flex direction="column" w="full" h="full">
          {currentQuestions && currentQuestions.length > 0 ? (
            <Table size="md" minW="1000px">
              <Thead>
                <Th>Question</Th>
                <Th>Options</Th>
                <Th>Answer</Th>
                <Th>Concert</Th>
                <Th>Actions</Th>
              </Thead>
              <Tbody>
                {currentQuestions.map(({ question, answers, type, options, _id, concert, timeLimit }) => {
                  return (
                    <Tr key={_id}>
                      <Td>{question}</Td>
                      <Td>
                        {type === "mcq" ? (
                          <Stack direction="row" wrap="wrap" display="flex" gridGap={2}>
                            {options.map((option, index) => (
                              <Badge
                                key={index}
                                textTransform="none"
                                colorScheme="purple"
                                variant="subtle"
                              >
                                {option}
                              </Badge>
                            ))}
                          </Stack>
                        ) : (
                          "No Options"
                        )}
                      </Td>
                      <Td>
                        <Stack direction="row" wrap="wrap" display="flex" gridGap={2}>
                          {answers.map((answer, index) => (
                            <Badge
                              key={index}
                              textTransform="none"
                              colorScheme="purple"
                              variant="subtle"
                            >
                              {answer}
                            </Badge>
                          ))}
                        </Stack>
                      </Td>
                      <Td>{concert.title}</Td>
                      <Td>
                        <IconButton
                          onClick={() => deleteQuestion(_id)}
                          icon={<MdDeleteOutline />}
                          colorScheme="red"
                          mr={3}
                        />
                        <EditQuestionModal
                          currentQuestion={{ _id, question, answers, type, options, concert, timeLimit }}
                          setQuestions={setQuestions}
                          questions={questions}
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
              <Tfoot>
                <Tr textAlign="center">
                  <Td colSpan={4}>
                    <Heading fontSize="xl" fontWeight="normal" color="GrayText">
                      {currentPage} / {totalPages}
                    </Heading>
                  </Td>
                  <Td display="flex">
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
            <NoMessage message="No Questions Found In This Category" />
          )}
        </Flex>
      </div>
    );
  }
};

export default Questions;
