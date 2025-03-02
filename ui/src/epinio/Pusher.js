import React from "react";
import { Box, Button, Grid, IconButton, Input } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CircularProgress from '@mui/material/CircularProgress';

export function Pusher(props) {
  const [folder, setFolder] = React.useState("");
  const [name, setName] = React.useState("test");
  const [progress, setProgress] = React.useState(null);

  const drag = (ev) => {
    setFolder(ev.dataTransfer.files[0].path);
  };

  const epinio = async (args) => {
    try {
      setProgress(true);
      var result = await window.ddClient.extension.host.cli.exec("epinio", args);
      setProgress(null);
      return result;
    } catch (error) {
      setProgress(null);
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      } else {
        console.error(JSON.stringify(error));
        if (error.stderr) {
          throw Error(error.stderr);
        } else {
          throw Error(JSON.stringify(error));
        }
      }
    }
  };

  const handleOpen = async (ev) => {
    const result = await window.ddClient.desktopUI.dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (!result.canceled) {
      if (result.filePaths.length > 0) {
        setFolder(result.filePaths[0]);
      }
    }
  };

  const send = async (ev) => {
    if (folder !== "" && name !== "") {
      window.ddClient.desktopUI.toast.success("Using buildpacks to deploy '" + name + "', this can take a few minutes.");
      try {
        var epinioURL = "https://"+props.apiDomain;
        var result = await epinio([
          "login", "--trust-ca", "-u", "admin", "-p", "password", epinioURL
        ]);
        if (result.stderr.length > 0) {
          console.log(result.stderr);
        }
        result = await epinio([
          "apps", "push",
          "-n", name,
          "-p", folder
        ]);
        if (result.stderr.length > 0) {
          console.log(result.stderr);
        }
        console.info(result.stdout);
      } catch(error) {
        props.onError("Epinio failed to deploy: " + error);
      }
    }
  };

  const spinner = progress ? <CircularProgress /> : null;
  return (
    <Grid container m={2}>
      <Grid item xs={3}>
        <label htmlFor="contained-input-name">
          <Input value={name} onChange={e => setName(e.target.value)} disabled={props.disabled} />
          <p>Name</p>
        </label>
      </Grid>

      <Grid item xs={6}>
        <Input onDrop={drag} value={folder} disabled={props.disabled} sx={{ width: '30ch' }} />
        <IconButton aria-label="open" onClick={handleOpen} disabled={props.disabled}>
          <FolderOpenIcon />
        </IconButton>
      </Grid>

      <Grid item xs={2}>
        <Button variant="outlined" startIcon={<SendIcon />} onClick={send} disabled={props.disabled}>Upload</Button>
      </Grid>
      <Grid item xs={1}>
        <Box sx={{display: 'flex'}}>
          {spinner}
        </Box>
      </Grid>

      <Grid item xs={12}>
        {props.list}
      </Grid>
    </Grid>
  )
}

export default Pusher;
