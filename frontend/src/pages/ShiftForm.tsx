import React, { FunctionComponent, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { getErrorMessage } from "../helper/error";
import {
  createShifts,
  getShiftById,
  updateShiftById,
} from "../helper/api/shift";
import { useHistory, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useEffect } from "react";
import Joi from "joi";

interface IFormInput {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

const shiftSchema = Joi.object({
  name: Joi.string().required(),
  date: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

interface RouteParams {
  id: string;
}

const ShiftForm: FunctionComponent = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEdit = id !== undefined;

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IFormInput>({
    resolver: joiResolver(shiftSchema),
  });

  useEffect(() => {
    const getData = async () => {
      try {
        if (!isEdit) {
          return;
        }

        const { result } = await getShiftById(id);

        setValue("name", result.name);
        setValue("date", result.date);
        setValue("startTime", result.startTime);
        setValue("endTime", result.endTime);
      } catch (error) {
        const message = getErrorMessage(error);
        setError(message);
      }
    };

    getData();
  }, [isEdit, id, setValue]);

  const onSubmit = async (data: IFormInput) => {
    try {
      setError("");

      if (isEdit) {
        await updateShiftById(id, data);
      } else {
        await createShifts(data);
      }

      history.push("/shift");
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            {error.length > 0 ? <Alert severity="error">{error}</Alert> : <></>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    inputProps={{ ...register("name") }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    inputProps={{ ...register("date") }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    inputProps={{ ...register("startTime") }}
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    inputProps={{ ...register("endTime") }}
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ShiftForm;
