import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/TaskAlt";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { addWeeks, parseISO, subWeeks } from "date-fns";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import { getErrorMessage } from "../helper/error";
import { deleteShiftById, getShifts, publishWeek } from "../helper/api/shift";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setError as setSchedulerError,
  setLoading as setSchedulerLoading,
  setSelectedWeekStart,
  setWeekData,
} from "../store/slices/schedulerSlice";
import {
  formatPublishedAt,
  formatWeekRangeLabel,
  getWeekBounds,
  getWeekStart,
} from "../helper/date";

const formatTime = (time: string) => time.slice(0, 5);

const Shift: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();

  const { selectedWeekStart, shifts, week, loading, error } = useAppSelector(
    (state) => state.scheduler
  );

  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCalendarOpen = Boolean(calendarAnchor);

  const effectiveWeekBounds = useMemo(() => {
    if (week) {
      return { startDate: week.startDate, endDate: week.endDate };
    }
    return getWeekBounds(selectedWeekStart);
  }, [week, selectedWeekStart]);

  const weekLabel = formatWeekRangeLabel(
    effectiveWeekBounds.startDate,
    effectiveWeekBounds.endDate
  );

  const publishedAtLabel = week?.isPublished
    ? formatPublishedAt(week.publishedAt)
    : "";

  const isPublished = week?.isPublished ?? false;
  const canPublish = !isPublished && shifts.length > 0 && !publishLoading;

  const navigateToWeek = (weekStart: string, replace = false) => {
    if (replace) {
      history.replace({ pathname: location.pathname, search: `?week=${weekStart}` });
    } else {
      history.push({ pathname: location.pathname, search: `?week=${weekStart}` });
    }
    dispatch(setSelectedWeekStart(weekStart));
  };

  useEffect(() => {
    setActionError(null);
  }, [selectedWeekStart]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryWeek = params.get("week");
    if (queryWeek) {
      let sanitized = queryWeek;
      try {
        sanitized = getWeekStart(parseISO(queryWeek));
      } catch (error) {
        sanitized = selectedWeekStart;
      }

      if (sanitized !== queryWeek) {
        history.replace({ pathname: location.pathname, search: `?week=${sanitized}` });
      }

      if (sanitized !== selectedWeekStart) {
        dispatch(setSelectedWeekStart(sanitized));
      }
      return;
    }

    history.replace({ pathname: location.pathname, search: `?week=${selectedWeekStart}` });
  }, [location.pathname, location.search, selectedWeekStart, dispatch, history]);

  const loadWeekData = useCallback(
    async (weekStart: string) => {
      dispatch(setSchedulerLoading(true));
      dispatch(setSchedulerError(null));
      try {
        const { results } = await getShifts({ weekStart });
        dispatch(setWeekData(results));
      } catch (err) {
        const message = getErrorMessage(err);
        dispatch(setSchedulerError(message));
        const bounds = getWeekBounds(weekStart);
        dispatch(
          setWeekData({
            shifts: [],
            week: {
              startDate: bounds.startDate,
              endDate: bounds.endDate,
              isPublished: false,
              publishedAt: null,
            },
          })
        );
      } finally {
        dispatch(setSchedulerLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (selectedWeekStart) {
      loadWeekData(selectedWeekStart);
    }
  }, [selectedWeekStart, loadWeekData]);

  const handlePrevWeek = () => {
    const previous = subWeeks(parseISO(selectedWeekStart), 1);
    navigateToWeek(getWeekStart(previous));
  };

  const handleNextWeek = () => {
    const next = addWeeks(parseISO(selectedWeekStart), 1);
    navigateToWeek(getWeekStart(next));
  };

  const openCalendar = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchor(event.currentTarget);
  };

  const closeCalendar = () => {
    setCalendarAnchor(null);
  };

  const handleDateSelect = (value: Date | null) => {
    if (value) {
      navigateToWeek(getWeekStart(value));
    }
    closeCalendar();
  };

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setActionError(null);

      if (!selectedId) {
        throw new Error("ID is null");
      }

      await deleteShiftById(selectedId);
      await loadWeekData(selectedWeekStart);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  const handlePublish = async () => {
    try {
      setPublishLoading(true);
      setActionError(null);
      await publishWeek(selectedWeekStart);
      await loadWeekData(selectedWeekStart);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPublishLoading(false);
    }
  };

  const handleAddShift = () => {
    history.push(`/shift/add?week=${selectedWeekStart}`);
  };

  const combinedError = actionError || error;

  return (
    <Box>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          {combinedError ? <Alert severity="error">{combinedError}</Alert> : null}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <IconButton onClick={handlePrevWeek} color="primary" size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ cursor: "pointer", fontWeight: 600 }}
                  onClick={openCalendar}
                  color="text.primary"
                >
                  {weekLabel}
                </Typography>
                {publishedAtLabel ? (
                  <Typography
                    variant="subtitle2"
                    color={theme.customColors.turquoise}
                    sx={{ fontWeight: 500 }}
                  >
                    Week published on {publishedAtLabel}
                  </Typography>
                ) : (
                  <Typography variant="subtitle2" color="text.secondary">
                    Week of {effectiveWeekBounds.startDate} - {effectiveWeekBounds.endDate}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={handleNextWeek} color="primary" size="small">
                <ChevronRightIcon />
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddShift}
                disabled={isPublished}
                sx={{
                  backgroundColor: theme.customColors.turquoise,
                  color: theme.palette.getContrastText(theme.customColors.turquoise),
                  "&:hover": {
                    backgroundColor: theme.customColors.turquoise,
                    opacity: 0.85,
                  },
                  "&.Mui-disabled": {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                Add Shift
              </Button>
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                onClick={handlePublish}
                disabled={!canPublish}
                sx={{
                  backgroundColor: theme.customColors.navy,
                  color: theme.palette.common.white,
                  "&:hover": {
                    backgroundColor: theme.customColors.navy,
                    opacity: 0.9,
                  },
                  "&.Mui-disabled": {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                Publish
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      There are no records to display
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{formatTime(row.startTime)}</TableCell>
                      <TableCell>{formatTime(row.endTime)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="edit"
                          component={RouterLink}
                          to={`/shift/${row.id}/edit?week=${selectedWeekStart}`}
                          disabled={isPublished}
                          sx={{ color: theme.palette.text.primary }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="delete"
                          onClick={() => onDeleteClick(row.id)}
                          disabled={isPublished}
                          sx={{ color: theme.palette.text.primary }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this shift?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />

      <Popover
        open={isCalendarOpen}
        anchorEl={calendarAnchor}
        onClose={closeCalendar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <DateCalendar value={parseISO(selectedWeekStart)} onChange={handleDateSelect} />
      </Popover>
    </Box>
  );
};

export default Shift;
