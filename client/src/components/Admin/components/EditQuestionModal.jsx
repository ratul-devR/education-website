import { useState, useEffect } from "react";
import { IconButton, Button } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import { FiEdit } from "react-icons/fi";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Tag, TagLabel, TagCloseButton } from "@chakra-ui/tag";
import validator from "validator";
import useToast from "../../../hooks/useToast";
import config from "../../../config";

export default function EditQuestionModal({ currentQuestion, setQuestions, questions }) {
  const [state, setState] = useState(currentQuestion);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setState((pre) => ({ ...pre, [name]: value }));
  }

  async function saveEdits() {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/updateQuestion/${state._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          question: state.question,
          answers: state.answers,
          options: state.options,
          timeLimit: state.timeLimit,
        }),
      });
      const body = await res.json();
      if (res.ok) {
        const updatedList = questions.map((question) => {
          if (question._id === body.question._id) {
            question.question = body.question.question;
            question.options = body.question.options;
            question.answers = body.question.answers;
            question.timeLimit = body.question.timeLimit;
          }
          return question;
        });
        setQuestions(updatedList);
        setState((pre) => ({
          ...pre,
          question: body.question.question,
          answers: body.question.answers,
          timeLimit: body.question.timeLimit,
          options: body.question.options,
        }));
        toast({ status: "success", description: body.msg });
        onClose();
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  function onCloseModal() {
    setState(currentQuestion);
    onClose();
  }

  return (
    <Flex display="inline-block">
      <IconButton icon={<FiEdit />} onClick={onOpen} colorScheme="blue" />
      <Modal scrollBehavior="inside" isOpen={isOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              p={5}
              direction="column"
              mb={5}
              rounded={3}
              border="1px solid"
              borderColor="gray.100"
            >
              <Text mb={3} color="GrayText">
                Question
              </Text>
              <Input
                placeholder="Edit question"
                value={state.question}
                onChange={handleInputChange}
                name="question"
              />
            </Flex>
            <Flex
              p={5}
              direction="column"
              mb={5}
              rounded={3}
              border="1px solid"
              borderColor="gray.100"
            >
              <Text mb={3} color="GrayText">
                Options
              </Text>
              <Input
                placeholder="Add New Answer"
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    !validator.isEmpty(e.target.value, { ignore_whitespace: true })
                  ) {
                    setState((pre) => ({
                      ...pre,
                      options: [...pre.options, validator.trim(e.target.value)],
                    }));
                  }
                }}
              />
              <Flex mt={3} gridGap={3} wrap="wrap">
                {state.options.length > 0 &&
                  state.options.map((option, index) => {
                    return (
                      <Tag colorScheme="purple" textTransform="none" key={index}>
                        <TagLabel>{option}</TagLabel>
                        <TagCloseButton
                          onClick={() => {
                            const updatedList = state.options.filter((op) => op != option);
                            setState((pre) => ({ ...pre, options: updatedList }));
                          }}
                        />
                      </Tag>
                    );
                  })}
              </Flex>
            </Flex>
            <Flex
              p={5}
              direction="column"
              mb={5}
              rounded={3}
              border="1px solid"
              borderColor="gray.100"
            >
              <Text mb={3} color="GrayText">
                Answers
              </Text>
              <Input
                placeholder="Add New Option"
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    !validator.isEmpty(e.target.value, { ignore_whitespace: true }) &&
                    state.options.includes(e.target.value)
                  ) {
                    setState((pre) => ({
                      ...pre,
                      answers: [...pre.answers, validator.trim(e.target.value)],
                    }));
                  }
                }}
              />
              <Flex mt={3} gridGap={3} wrap="wrap">
                {state.answers.length > 0 &&
                  state.answers.map((answer, index) => {
                    return (
                      <Tag colorScheme="purple" textTransform="none" key={index}>
                        <TagLabel>{answer}</TagLabel>
                        <TagCloseButton
                          onClick={() => {
                            const updatedList = state.answers.filter((ans) => ans != answer);
                            setState((pre) => ({ ...pre, answers: updatedList }));
                          }}
                        />
                      </Tag>
                    );
                  })}
              </Flex>
            </Flex>
            <Flex
              p={5}
              direction="column"
              mb={5}
              rounded={3}
              border="1px solid"
              borderColor="gray.100"
            >
              <Text mb={3} color="GrayText">
                TimeLimit
              </Text>
              <Input
                placeholder="Edit time limit"
                type="number"
                value={state.timeLimit}
                onChange={handleInputChange}
                name="timeLimit"
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onCloseModal}>
              Close
            </Button>
            <Button
              onClick={saveEdits}
              disabled={
                !state.question ||
                !state.timeLimit ||
                !state.options.length ||
                !state.answers.length
              }
              colorScheme="blue"
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
