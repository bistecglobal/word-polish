import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import { OpenAiApi } from "../../services/openai";
import { Component } from "react";
import KeyIcon from "@mui/icons-material/Key";
import { Button, IconButton } from "@mui/material";
import axios from "axios";

/* global Word, require */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  listItems: HeroListItem[];
  apiKey: string;

  presetFormat: string;
  showModalEdit: boolean;
  showModalAdd: boolean;
  showModalSystem: boolean;
  showPopup: boolean;
  isLoading: boolean;
  promptPreset: any[];
  selectedIndex: number;
  promptFormat: string;
  promptSystem: string;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: [],
      apiKey: "",
      presetFormat: "",
      promptFormat: "",
      showModalEdit: false,
      showModalAdd: false,
      showModalSystem: false,
      showPopup: false,
      isLoading: false,
      promptPreset: [],
      selectedIndex: 0,
      promptSystem: "",
    };
  }

  componentDidMount() {
    const apikeyValue = Office.context.document.settings.get("apikey");
    {
      const apikey = JSON.parse(apikeyValue) || [];
      this.setState({ apiKey: apikey });
    }
    const result = Office.context.document.settings.get("promtPreset");
    {
      const promtPreset = JSON.parse(result) || [];
      this.setState({ promptPreset: promtPreset });
    }
  }

  toggleModalEdit = () => {
    if (this.state.promptPreset.length > 0) {
      if (this.state.selectedIndex === 0) {
        this.populateEditFields(0);
      }
      this.setState((prevState) => ({
        showModalEdit: !prevState.showModalEdit,
      }));
    }
  };

  toggleModalAdd = () => {
    this.setState({
      promptFormat: "Covert this text to ",
    });
    this.setState((prevState) => ({
      showModalAdd: !prevState.showModalAdd,
    }));
  };

  // toggleModalSystem = () => {
  //   this.setState({
  //     promptSystem: 'Covert this text to '
  //   });
  //   this.setState((prevState) => ({
  //     showModalSystem: !prevState.showModalSystem,
  //   }));
  // };

  toggleshowPopup = () => {
    this.setState((prevState) => ({
      showPopup: !prevState.showPopup,
    }));
  };
  toggleAPIKeySave = () => {
    Office.context.document.settings.set("apikey", JSON.stringify(this.state.apiKey));
    Office.context.document.settings.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("Custom setting saved successfully");
      } else {
        console.error("Error saving custom setting: " + result.error.message);
      }
    });
  };
  toggleModalSave = () => {
    Office.context.document.settings.remove("promtPreset");
    // Create a new item to add to promtPreset
    const newItem = {
      format: this.state.presetFormat,
      promptFromat: this.state.promptFormat,
    };
    // Add the new item to the existing promtPreset
    const updatedPromtPreset = [...this.state.promptPreset, newItem];

    // Save the updated promtPreset settings after converting to JSON
    Office.context.document.settings.set("promtPreset", JSON.stringify(updatedPromtPreset));
    Office.context.document.settings.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("Custom setting saved successfully");
        this.setState({ promptPreset: updatedPromtPreset }); // Update state with the new promtPreset
      } else {
        console.error("Error saving custom setting: " + result.error.message);
      }
    });
    this.toggleModalAdd();
  };

  // Function to populate the editing modal fields with the values of the selected item
  populateEditFields = (index) => {
    const selectedPreset = this.state.promptPreset[index];
    if (selectedPreset != "" && selectedPreset != "") {
      this.setState({
        selectedIndex: index,
        presetFormat: selectedPreset.format,
        promptFormat: selectedPreset.promptFromat,

        // Set other modal fields if needed
      });
    }
    console.log("Custom setting" + this.state.promptFormat);
  };
  onChangeDropdown = (value, index) => {
    this.setState({ presetFormat: value });
    this.populateEditFields(index);
    console.log(value + "   " + index);
  };
  toggleModalUpdate = () => {
    const { selectedIndex } = this.state;

    if (selectedIndex === -1) {
      // No item selected for updating, return
      return;
    }

    const updatedItem = {
      format: this.state.presetFormat,
      promptFromat: this.state.promptFormat,
    };

    const updatedPromtPreset = [...this.state.promptPreset];
    updatedPromtPreset[selectedIndex] = updatedItem;

    Office.context.document.settings.set("promtPreset", JSON.stringify(updatedPromtPreset));
    Office.context.document.settings.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("Custom setting saved successfully");
        this.setState({
          promptPreset: updatedPromtPreset,
          selectedIndex: -1,
        });
      } else {
        console.error("Error saving custom setting: " + result.error.message);
      }
    });
    this.toggleModalEdit();
  };

  convert = async () => {
    this.setState({ isLoading: true }); // Set loading to true when conversion starts

    return Word.run(async (context) => {
      try {
        const words = context.document.getSelection();
        const word = words.load();
        await context.sync();

        const prompt = this.state.promptFormat + word.text.trim();
        // Assuming you have an instance of OpenAiApi available
        const openai = new OpenAiApi(this.state.apiKey);
        
      

        const converted = await openai.generateText(this.state.promptFormat, word.text.trim());
        words.insertText(converted, "Replace");
        await context.sync();
       

        this.setState({ promptSystem: prompt });

      } catch (e) {
        const paragraph = context.document.body.insertParagraph(JSON.stringify(e), Word.InsertLocation.end);
        paragraph.font.color = "blue";
        await context.sync();
      } finally {
        this.setState({ isLoading: false }); // Set loading to false when conversion is done (or if an error occurs)
      }
    });
  };

  click = async () => {
    return Word.run(async (context) => {
      /**
       * Insert your Word code here
       */

      // insert a paragraph at the end of the document.
      const paragraph = context.document.body.insertParagraph("Hello World", Word.InsertLocation.end);

      // change the paragraph color to blue.
      paragraph.font.color = "blue";

      await context.sync();
    });
  };

  sendDataToServer = (promtPreset) => {
    axios
      .post("/api/saveData", promtPreset)
      .then((response) => {
        console.log("Data sent successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error sending data: ", error);
      });
  };

   render() {
    const { showModalEdit, showModalAdd, showPopup, isLoading } = this.state;

    return (
      <div className="ms-welcome">
        <Header logo={require("./../../../assets/BisLogo.png")} title={this.props.title} message="Welcome" />

        <HeroList message="Convert your content to predefined presets with chat gpt" items={this.state.listItems}>
          <div className="ms-text-level">
            <label className="ms-font-2">Select a Preset:</label>
            <div className="ms-dropdown">
              <select
                className="ms-dropbtn"
                onChange={(e) => this.onChangeDropdown(e.target.value, e.target.selectedIndex)}
              >
                {this.state.promptPreset.map((preset, index) => (
                  <option key={index} value={preset.format}>
                    {preset.format}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DefaultButton className="ms-welcome__action1" onClick={this.convert}>
            {isLoading ? "Converting..." : "Convert"}
          </DefaultButton>

          <DefaultButton className="ms-welcome__action2" onClick={this.toggleModalEdit}>
            Edit
          </DefaultButton>

          <DefaultButton className="ms-welcome__action3" onClick={this.toggleModalAdd}>
            Add
          </DefaultButton>

          <IconButton className="ms-icon" onClick={this.toggleshowPopup}>
            <KeyIcon />
          </IconButton>

          {showModalEdit && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={this.toggleModalEdit}>
                  &times;
                </span>

                <div className="ms-prompt">
                  <label className="ms-font-2-2">Prompt</label>
                  <div className="ms-preset-inputbox-3">
                    <textarea
                      id="noter-text-area"
                      name="textarea"
                      value={this.state.promptFormat}
                      className="ms-input-3-1"
                      title="Your Prompt"
                      style={{ fontSize: "15.rem", width: "243px", height: "243px" }}
                      onChange={(e) => this.setState({ promptFormat: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <DefaultButton className="ms-edit-save" onClick={this.toggleModalUpdate}>
                  Save
                </DefaultButton>
              </div>
            </div>
          )}

          {showModalAdd && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={this.toggleModalAdd}>
                  &times;
                </span>
                <form>
                  <div className="ms-preset">
                    <label className="ms-font-2-3">Act as a:</label>
                    <div className="ms-preset-inputbox2">
                      <input
                        required
                        className="ms-input-3"
                        title="act as a"
                        style={{ fontSize: "15.rem" }}
                        type="text"
                        onChange={(e) => this.setState({ presetFormat: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="ms-prompt">
                    <label className="ms-font-2-2">Prompt</label>
                    <div className="ms-preset-inputbox-3">
                      <textarea
                        id="noter-text-area"
                        name="textarea"
                        className="ms-input-3-1"
                        title="Your Prompt"
                        style={{ fontSize: "15.rem", width: "243px", height: "243px" }}
                        value={this.state.promptFormat}
                        onChange={(e) => this.setState({ promptFormat: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <DefaultButton className="ms-edit-save" onClick={this.toggleModalSave}>
                    Save
                  </DefaultButton>
                </form>
              </div>
            </div>
          )}

          <div className="ms-text-area">
            <div className="ms-SystemPrompt">
              <label className="ms-font-2-2">Title</label>
              <div className="ms-preset-inputbox-3">
                <textarea
                  readOnly
                  id="noter-text-area"
                  name="textarea"
                  className="ms-input-4-1"
                  title="Your Prompt"
                  style={{ fontSize: "15.rem", width: "243px", height: "20px" }}
                  value={this.state.presetFormat}
                  // onChange={(e) => this.setState({ presetFormat: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="ms-SystemPrompt">
              <label className="ms-font-2-2">User Prompt</label>
              <div className="ms-preset-inputbox-3">
                <textarea
                  readOnly
                  id="noter-text-area"
                  name="textarea"
                  className="ms-input-4-1"
                  title="Your Prompt"
                  style={{ fontSize: "15.rem", width: "243px", height: "80px" }}
                  value={this.state.promptFormat}
                  // onChange={(e) => this.setState({ promptFormat: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="ms-SystemPrompt">
              <label className="ms-font-2-2">System Prompt</label>
              <div className="ms-preset-inputbox-3">
                <textarea
                  readOnly
                  id="noter-text-area"
                  name="textarea"
                  className="ms-input-4-1"
                  title="Your Prompt"
                  style={{ fontSize: "15.rem", width: "243px", height: "150px" }}
                  value={this.state.promptSystem}
                  // onChange={(e) => this.setState({ promptSystem: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          {showPopup && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={this.toggleshowPopup}>
                  &times;
                </span>

                <div className="ms-word-count">
                  <label className="ms-font-2-1">API Key</label>
                  <div className="ms-inputbox3">
                    <input
                      className="ms-input-5"
                      title="api key"
                      style={{ fontSize: "15.rem" }}
                      type="text"
                      onChange={(e) => this.setState({ apiKey: e.target.value })}
                    />
                  </div>
                </div>

                <DefaultButton className="ms-edit-save" onClick={this.toggleAPIKeySave}>
                  Save
                </DefaultButton>
              </div>
            </div>
          )}
        </HeroList>
      </div>
    );
  }
}
