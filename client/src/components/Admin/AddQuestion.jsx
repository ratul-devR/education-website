import { Flex } from "@chakra-ui/layout";
import { useParams } from "react-router-dom";
import { Input } from "@chakra-ui/input";
import { Heading } from "@chakra-ui/react";
import { useState } from "react";
import { Button, IconButton } from "@chakra-ui/button";
import { MdDeleteOutline } from "react-icons/md";
import { Tooltip } from "@chakra-ui/tooltip";
import { Select } from "@chakra-ui/select";
import useToast from "../../hooks/useToast";
import { useHistory } from "react-router-dom";
import config from "../../config";

const AddQuestion = () => {
  const [{ question, answer }, setInput] = useState({ question: "", answer: "" });
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);
  const { categoryId, categoryName } = useParams();
  const toast = useToast();
  const history = useHistory();

  // for handling input change
  function HandleInputChange(event) {
    const { name, value } = event.target;
    setInput((pre) => ({ ...pre, [name]: value }));
  }

  // for adding an option
  function AddOption(e) {
    e.preventDefault();
    if (optionInput !== "") {
      setOptionInput("");
      setOptions((pre) => [
        ...pre,
        { _id: Date.now() + Math.floor(Math.random() * 100), option: optionInput },
      ]);
    }
  }

  // for removing an option
  function removeOption(id) {
    setOptions((pre) => pre.filter((i) => i._id != id));
  }

  // for adding question to the category
  async function addQuestionToCategory() {
    const optionsToSend = options.map((i) => i.option);
    try {
      const res = await fetch(`${config.serverURL}/get_admin/add_question/${categoryId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, options: optionsToSend }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        toast({ status: "success", description: body.msg });
        history.push("/admin");
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "We are having errors" });
    }
  }

  return (
    <Flex direction="column" w="100%" maxW="400px" margin="auto">
      <Heading textAlign="center" color="primary" mb={5} fontWeight="normal" fontSize="2xl">
        Add Question to "{categoryName}"
      </Heading>
      <Input
        mb={3}
        placeholder="Enter the question"
        name="question"
        value={question}
        onChange={HandleInputChange}
      />
      <form onSubmit={AddOption}>
        <Input
          onChange={(event) => setOptionInput(event.target.value)}
          value={optionInput}
          placeholder="Enter the options > hit enter"
        />
      </form>
      {options && (
        <Flex direction="column" mb={3}>
          {options.length > 0 &&
            options.map(({ _id, option }) => {
              return (
                <Flex
                  justify="space-between"
                  align="center"
                  bg="white"
                  p={5}
                  mb={1}
                  rounded={5}
                  mt={3}
                  boxShadow="md"
                  key={_id}
                >
                  <Heading fontSize="md" fontWeight="normal">
                    {option}
                  </Heading>

                  <Tooltip label="Remove option" hasArrow>
                    <IconButton
                      colorScheme="red"
                      onClick={() => removeOption(_id)}
                      icon={<MdDeleteOutline />}
                    />
                  </Tooltip>
                </Flex>
              );
            })}
        </Flex>
      )}

      <Select
        placeholder="Correct answer"
        mb={3}
        name="answer"
        onChange={HandleInputChange}
        value={answer}
      >
        {options &&
          options.length &&
          options.map(({ _id, option }) => {
            return (
              <option key={_id} value={option}>
                {option}
              </option>
            );
          })}
      </Select>

      <Button
        colorScheme="secondary"
        disabled={!options || options.length == 0 || !answer || !question}
        onClick={addQuestionToCategory}
      >
        Add Question
      </Button>
    </Flex>
  );
};

export default AddQuestion;
