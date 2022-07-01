import { Box, Checkbox, Heading, Text } from "@chakra-ui/react";
import React from "react";

function SelectList({ listItems, setStateAction, state, listTitle, listDescription, styles }) {
  const handleChange = (e) => {
    const { checked, value } = e.target;
    let prerequisites = [];

    if (checked) {
      prerequisites = [...state.prerequisites, value];
    } else {
      prerequisites = state.prerequisites.filter((prerequisite) => prerequisite !== value);
    }

    setStateAction((pre) => ({ ...pre, prerequisites }));
  };

  return (
    <Box p={5} border="1px solid" borderColor={"gray.100"} rounded={5} style={styles}>
      <Box mb={3}>
        <Heading fontSize={"lg"} mb={2} fontWeight={"normal"} color="primary">
          {listTitle}
        </Heading>
        {listDescription && <Text color={"GrayText"}>{listDescription}</Text>}
      </Box>
      {listItems &&
        listItems.length &&
        listItems.map((item) => {
          return (
            <Box key={item._id} mb={1}>
              <Checkbox
                defaultChecked={state.prerequisites.includes(item._id)}
                value={item._id}
                onChange={handleChange}
              >
                {item.name}
              </Checkbox>
            </Box>
          );
        })}
    </Box>
  );
}

export default SelectList;
