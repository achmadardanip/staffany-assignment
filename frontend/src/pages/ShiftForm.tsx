import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { getErrorMessage } from "../helper/error";
import {
  createShifts,
  getShiftById,
  updateShiftById,
} from "../helper/api/shift";
import { Link as RouterLink, useHistory, useLocation, useParams } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import AlertTitle from "@mui/material/AlertTitle";
import Joi from "joi";
import {
  formatTime,
  formatWeekRangeLabel,
  getDefaultEndTime,
  getStartOfCurrentHour,
  getWeekBounds,
  getWeekStart,
} from "../helper/date";
import { parseISO } from "date-fns";
import ClashDialog, { ClashShift } from "../components/ClashDialog";

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
  const location = useLocation();
  const { id } = useParams<RouteParams>();
  const isEdit = id !== undefined;
  const { selectedWeekStart } = useAppSelector((state) => state.scheduler);

  const params = new URLSearchParams(location.search);
  const queryWeek = params.get("week");

  const initialWeekStart = useMemo(() => {
    try {
      if (queryWeek) {
        return getWeekStart(parseISO(queryWeek));
      }
    } catch (error) {
      // ignore invalid query
    }
    if (selectedWeekStart) {
      return getWeekStart(parseISO(selectedWeekStart));
    }
    return getWeekStart(new Date());
  }, [queryWeek, selectedWeekStart]);

  const [originWeekStart, setOriginWeekStart] = useState<string>(initialWeekStart);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(isEdit);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [clashShift, setClashShift] = useState<ClashShift | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<IFormInput | null>(null);
  const [ignoreLoading, setIgnoreLoading] = useState(false);

  const hourStart = useMemo(() => getStartOfCurrentHour(), []);
  const defaultStartTime = useMemo(() => formatTime(hourStart), [hourStart]);
  const defaultEndTime = useMemo(
    () => formatTime(getDefaultEndTime(hourStart)),
    [hourStart]
  );

  const formDefaultValues = useMemo(
    () => ({
      name: "",
      date: initialWeekStart,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    }),
    [initialWeekStart, defaultStartTime, defaultEndTime]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<IFormInput>({
    resolver: joiResolver(shiftSchema),
    defaultValues: formDefaultValues,
  });

  useEffect(() => {
    if (!isEdit) {
      setOriginWeekStart(initialWeekStart);
    }
  }, [initialWeekStart, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      reset(formDefaultValues);
    }
  }, [isEdit, formDefaultValues, reset]);

  useEffect(() => {
    const getData = async () => {
      try {
        if (!isEdit) {
          setIsLoading(false);
          return;
        }

        const { results } = await getShiftById(id);

        setValue("name", results.name);
        setValue("date", results.date);
        setValue("startTime", results.startTime.slice(0, 5));
        setValue("endTime", results.endTime.slice(0, 5));
        setOriginWeekStart(getWeekStart(parseISO(results.date)));
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [isEdit, id, setValue]);

  const redirectToWeek = (weekStart: string) => {
    history.push(`/shift?week=${weekStart}`);
  };

  const submitPayload = async (data: IFormInput, ignoreClash = false) => {
    try {
      setIsSubmitting(true);
      setError("");
      const payload = { ...data, ignoreClash };
      const response = isEdit
        ? await updateShiftById(id, payload)
        : await createShifts(payload);
      const { results } = response;
      const targetWeek = getWeekStart(parseISO(results.date));
      redirectToWeek(targetWeek);
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.data?.conflictShift) {
        setClashShift(err.response.data.data.conflictShift);
        setPendingSubmission(data);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: IFormInput) => {
    await submitPayload(data, false);
  };

  const onIgnoreClash = async () => {
    if (!pendingSubmission) {
      setClashShift(null);
      return;
    }
    try {
      setIgnoreLoading(true);
      await submitPayload(pendingSubmission, true);
    } finally {
      setIgnoreLoading(false);
      setClashShift(null);
      setPendingSubmission(null);
    }
  };

  const onCancelClash = () => {
    setClashShift(null);
    setPendingSubmission(null);
  };

  const handleBack = () => {
    redirectToWeek(originWeekStart);
  };

  const boundsLabel = useMemo(() => {
    const bounds = getWeekBounds(originWeekStart);
    return formatWeekRangeLabel(bounds.startDate, bounds.endDate);
  }, [originWeekStart]);

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Button variant="contained" color="secondary" onClick={handleBack}>
              Back
            </Button>
            <Typography variant="subtitle2" color="text.secondary">
              Week: {boundsLabel}
            </Typography>
          </Box>
          {error.length > 0 ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          ) : null}
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shift Name"
                    inputProps={{ ...register("name") }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="contained"
                      color="secondary"
                      component={RouterLink}
                      to={`/shift?week=${originWeekStart}`}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isEdit ? "Save Changes" : "Create Shift"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
      <ClashDialog
        open={!!clashShift}
        conflictShift={clashShift}
        onCancel={onCancelClash}
        onIgnore={onIgnoreClash}
        loading={ignoreLoading || isSubmitting}
      />
    </Box>
  );
};

export default ShiftForm;
