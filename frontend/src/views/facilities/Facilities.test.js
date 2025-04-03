import {
  render,
  screen,
  fireEvent,
  waitFor
} from "@testing-library/react";
import Facilities from "./Facilities";
import { useAuth } from "../../context/AuthContext";
import { useFacilitiesAndReservations } from "../../context/FacilitiesAndReservationsContext";
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../utils/mocks";
import { toast } from 'sonner';
import { act } from 'react-dom/test-utils';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../context/FacilitiesAndReservationsContext', () => ({
  useFacilitiesAndReservations: jest.fn()
}));

jest.mock('../../utils/mails', () => ({
  sendEmail: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    warning: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    promise: jest.fn((fn) => fn()),
  },
}));

describe("Facilities Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue(mockAuthContext);
    useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
    jest.clearAllMocks();
  });

  describe("Rendering when user is not logged in", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ ...mockAuthContext, user: null });
    });
    it("renders message for non-logged in users", () => {
      useAuth.mockReturnValue({ ...mockAuthContext, user: null });
      render(<Facilities />);
      expect(screen.getByText(/Debes iniciar sesión para reservar/i)).toBeInTheDocument();
    });

    it("does not render reservation form for non-logged in users", () => {
      useAuth.mockReturnValue({ ...mockAuthContext, user: null });
      render(<Facilities />);
      expect(screen.queryByRole('form', { className: 'form-reservar' })).not.toBeInTheDocument();
    });
  });

  describe("User logged in", () => {
    beforeEach(() => {
      mockAuthContext.user = { _id: '1', email: 'test@test.com', role: 'user' };
    });

    describe("Rendering and Initial Display", () => {
      beforeEach(() => {
        mockAuthContext.user = { _id: '1', email: 'test@test.com', role: 'user' };
      });
      it("renders the component and title", () => {
        render(<Facilities />);
        expect(screen.getByRole('heading', { name: /Instalaciones/i })).toBeInTheDocument();
      });

      it("displays facilities after successful API call", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1' }, { _id: '2', name: 'Pista 2' }]);
        render(<Facilities />);
        await waitFor(() => {
          expect(screen.getByRole('option', { name: /Pista 1/i })).toBeInTheDocument();
          expect(screen.getByRole('option', { name: /Pista 2/i })).toBeInTheDocument();
        });
      });

      it("displays message for non-logged in users", () => {
        useAuth.mockReturnValue({ ...mockAuthContext, user: null });
        render(<Facilities />);
        expect(screen.getByText(/Debes iniciar sesión para reservar/i)).toBeInTheDocument();
      });

      it("does not render reservation form for non-logged in users", () => {
        useAuth.mockReturnValue({ ...mockAuthContext, user: null });
        render(<Facilities />);
        expect(screen.queryByRole('form', { className: 'form-reservar' })).not.toBeInTheDocument();
      });

      it("renders reservation form for logged in users", () => {
        render(<Facilities />);
        expect(document.querySelector('.form-reservar')).toBeInTheDocument();
      });

      it("displays schedule, price and capacity per reservation when a facility is selected", async () => {
        const facility = {
          _id: '1',
          name: 'Pista 1',
          priceForHalfHour: 20,
          capacity: 5,
          schedule: {
            initialHour: new Date(),
            endHour: new Date()
          }
        };

        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facility]);
        mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facility);

        render(<Facilities />);

        const select = await screen.findByRole('combobox', { name: /instalación/i });
        fireEvent.change(select, { target: { value: '1' } });

        await waitFor(() => {
          expect(screen.getByText(/Precio por media hora: 20€./i)).toBeInTheDocument();
          expect(screen.getByText(/Capacidad por reserva para Pista 1: 5/i)).toBeInTheDocument();
          expect(screen.getByText(/Horario inicio:/i)).toBeInTheDocument();
          expect(screen.getByText(/Horario fin:/i)).toBeInTheDocument();
        });
      });


      it("renders DatePicker and Reservar button when facility is selected", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1', priceForHalfHour: 20 }]);
        mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({ _id: '1', name: 'Pista 1', schedule: { initialHour: new Date('2023-08-03T09:00'), endHour: new Date('2023-08-03T19:00') }, priceForHalfHour: 20, capacity: 5 });

        render(<Facilities />);
        await waitFor(() => {
          fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
          expect(screen.getByRole('textbox')).toBeInTheDocument(); // DatePicker
          expect(screen.getByRole('button', { name: /Reservar/i })).toBeInTheDocument();
        });
      });
    });

    // TODO: completar tests desde aquí
    describe("Functionality", () => {
      beforeEach(() => {
        mockAuthContext.user = { _id: '1', email: 'test@test.com', role: 'user' };
      });
      it("updates selectedInstalacionId state on facility selection", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1' }]);
        render(<Facilities />);

        await waitFor(() => {
          fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
        });
      });

      it("calls obtenerInstalacionCompleta  when facility is selected", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1' }]);
        render(<Facilities />);

        await waitFor(async () => {
          fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
          await new Promise(resolve => setTimeout(resolve, 0));
          expect(mockFacilitiesAndReservationsContext.getFacility).toHaveBeenCalled();
        });
      });

      it("updates startDate state on date change in DatePicker", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1', priceForHalfHour: 20 }]);
        mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({ _id: '1', name: 'Pista 1', schedule: { initialHour: new Date('2023-08-03T09:00'), endHour: new Date('2023-08-03T19:00') }, priceForHalfHour: 20, capacity: 5 });
        render(<Facilities />);

        await waitFor(() => {
          fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
          const datePicker = screen.getByRole('textbox');
          fireEvent.change(datePicker, { target: { value: new Date('2024-08-05T10:30') } });
          expect(datePicker.value).toMatch(/^Mon Aug 05 2024 10:30:00 GMT\+0200/);
        });
      });

      it("calls handleReservation on valid form submit", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{
          _id: "1",
          name: "Fútbol sala",
          priceForHalfHour: 20,
          capacity: 5,
          description: "Pista de fútbol sala",
          schedule: { initialHour: new Date("2023-08-03T09:00"), endHour: new Date("2023-08-03T19:00") },
          isInternSport: true,
        }]);
        mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({
          _id: "1",
          name: "Fútbol sala",
          priceForHalfHour: 20,
          capacity: 5,
          description: "Pista de fútbol sala",
          schedule: { initialHour: new Date("2023-08-03T09:00"), endHour: new Date("2023-08-03T19:30") },
          isInternSport: true,
        });
        mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);
        mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: true, data: { totalPrice: 20 } });
        mockFacilitiesAndReservationsContext.getMinTime.mockResolvedValue(new Date(new Date().setHours(9, 0, 0)));
        mockFacilitiesAndReservationsContext.getMaxTime.mockResolvedValue(new Date(new Date().setHours(19, 30, 0)));

        render(<Facilities />);

        await waitFor(() => {
          fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
          expect(screen.getByText(/Precio por media hora: 20€./i)).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByText(/Capacidad por reserva para Fútbol sala:/i)).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByRole("textbox")).toBeInTheDocument();
        });

        const datePicker = screen.getByRole("textbox");
        fireEvent.change(datePicker, { target: { value: "2024-08-05T10:00" } });

        await waitFor(() => {
          const submitButton = screen.getByRole("button", { name: /Reservar/i });
          expect(submitButton).not.toBeDisabled();
          fireEvent.click(submitButton);
        });

        // await waitFor(() => {
        //     expect(mockFacilitiesAndReservationsContext.addReservation).toHaveBeenCalledTimes(1);
        // });
      });

    });
  });

  describe("Gym and Athletics Subscription", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("shows warning and prevents selection if user lacks active Gym subscription", async () => {
      toast.warning.mockClear();

      mockAuthContext.user = {
        _id: '1',
        email: 'test@test.com',
        name: 'Test User',
        subscription: { gym: { isActive: false } }
      };

      const facilitiesMock = [{ _id: '1', name: 'Gimnasio' }];
      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue(facilitiesMock);

      render(<Facilities />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Gimnasio' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), {
        target: { value: '1' }
      });

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith('No tienes una suscripción activa en Gimnasio.');
      });
      await waitFor(() => {
        const select = screen.getByRole('combobox', { name: /instalación/i });
        expect(select.value).toBe('');
      });
    });

    it("shows warning and prevents selection if user lacks active Athletics subscription", async () => {
      toast.warning.mockClear();

      mockAuthContext.user = {
        _id: '1',
        email: 'test@test.com',
        name: 'Test User',
        subscription: { athletics: { isActive: false } }
      };

      const facilitiesMock = [{ _id: '2', name: 'Atletismo' }];
      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue(facilitiesMock);

      render(<Facilities />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Atletismo' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), {
        target: { value: '2' }
      });

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith('No tienes una suscripción activa en Atletismo.');
      });
      await waitFor(() => {
        const select = screen.getByRole('combobox', { name: /instalación/i });
        expect(select.value).toBe('');
      });
    });

    it("allows selection if user has active subscriptions for Gym and Athletics", async () => {
      mockAuthContext.user = {
        _id: '1',
        email: 'test@test.com',
        name: 'Test User',
        registration: {
          gym: { isActive: true },
          athletics: { isActive: true }
        },
        subscription: {
          gym: { isActive: true },
          athletics: { isActive: true }
        }
      };

      const facilitiesMock = [
        { _id: '1', name: 'Gimnasio' },
        { _id: '2', name: 'Atletismo' }
      ];

      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue(facilitiesMock);
      mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({
        _id: '1',
        name: 'Gimnasio',
        schedule: {
          initialHour: new Date(),
          endHour: new Date()
        },
        capacity: 5,
        priceForHalfHour: 10
      });

      render(<Facilities />);

      // Wait for the facilities to be rendered
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Gimnasio' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), {
        target: { value: '1' }
      });

      // Wait for the facility details to be displayed
      await waitFor(() => {
        expect(
          screen.getByText(/Capacidad por reserva para Gimnasio: 5/i)
        ).toBeInTheDocument();
      });
    });
  });
  it("generates time slots when selecting date", async () => {
    const facility = {
      _id: '1',
      name: 'Pista 1',
      priceForHalfHour: 20,
      capacity: 5,
      schedule: {
        initialHour: new Date('2023-08-03T09:00'),
        endHour: new Date('2023-08-03T11:00')
      }
    };

    mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facility]);
    mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facility);
    mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);

    render(<Facilities />);

    fireEvent.change(await screen.findByRole('combobox'), { target: { value: '1' } });

    const datePicker = await screen.findByRole("textbox");
    fireEvent.change(datePicker, { target: { value: '2025-04-05' } });

    await waitFor(() => {
      expect(mockFacilitiesAndReservationsContext.countReservationsByTimeSlot).toHaveBeenCalled();
    });
  });

  describe('Facilities - DatePicker and Time Slots', () => {
    const facilityMock = {
      _id: '1',
      name: 'Pista 1',
      priceForHalfHour: 20,
      capacity: 3,
      schedule: {
        initialHour: '2025-04-01T09:00:00.000Z',
        endHour: '2025-04-01T11:00:00.000Z',
      }
    };

    it("After selecting a date it generates the timeSlots", async () => {
      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facilityMock]);
      mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facilityMock);
      mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);

      render(<Facilities />);

      fireEvent.change(await screen.findByRole('combobox'), { target: { value: '1' } });

      const input = await screen.findByPlaceholderText(/Selecciona una fecha/i);
      fireEvent.click(input);

      const allDayButtons = await screen.findAllByText("1");
      const validDay = allDayButtons.find(el => el.getAttribute("aria-disabled") !== "true");
      fireEvent.click(validDay);

      await waitFor(() => {
        expect(screen.getAllByTitle(/huecos disponibles/i).length).toBeGreaterThan(0);
      });
    });

    it("generates slots by clicking on calendar day", async () => {
      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facilityMock]);
      mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facilityMock);
      mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);

      render(<Facilities />);

      fireEvent.change(await screen.findByRole('combobox'), { target: { value: '1' } });

      const input = await screen.findByPlaceholderText(/Selecciona una fecha/i);
      fireEvent.click(input);

      const allDayButtons = await screen.findAllByText("1");
      const dayButton = allDayButtons.find(el => el.getAttribute("aria-disabled") !== "true");
      fireEvent.click(dayButton);

      await waitFor(() => {
        expect(mockFacilitiesAndReservationsContext.countReservationsByTimeSlot).toHaveBeenCalled();
      });
    });

    it("should not show slot-grid after reservation", async () => {
      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facilityMock]);
      mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facilityMock);
      mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);
      mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: true, data: { totalPrice: 20 } });

      render(<Facilities />);

      fireEvent.change(await screen.findByRole('combobox'), { target: { value: '1' } });

      const input = await screen.findByPlaceholderText(/Selecciona una fecha/i);
      fireEvent.click(input);

      const allDayButtons = await screen.findAllByText("1");
      const validDay = allDayButtons.find(el => el.getAttribute("aria-disabled") !== "true");
      fireEvent.click(validDay);

      await waitFor(() => {
        expect(screen.getAllByTitle(/huecos disponibles/i).length).toBeGreaterThan(0);
      });

      const submitBtn = await screen.findByRole('button', { name: /Reservar/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.queryByRole('grid')).not.toBeInTheDocument();
        expect(screen.queryByText(/huecos disponibles/i)).not.toBeInTheDocument();
      });
    });

    it("should allow to select an available slot and marks it as selected", async () => {
      const facilityMock = {
        _id: '1',
        name: 'Pista 1',
        priceForHalfHour: 20,
        capacity: 3,
        schedule: {
          initialHour: '2025-04-01T09:00:00.000Z',
          endHour: '2025-04-01T11:00:00.000Z',
        }
      };
    
      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facilityMock]);
      mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facilityMock);
      mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);
    
      render(<Facilities />);
    
      fireEvent.change(await screen.findByRole('combobox'), { target: { value: '1' } });
    
      const input = await screen.findByPlaceholderText(/Selecciona una fecha/i);
      fireEvent.click(input);
    
      const allDayButtons = await screen.findAllByText("1");
      const validDay = allDayButtons.find(el => el.getAttribute("aria-disabled") !== "true");
      fireEvent.click(validDay);
    
      const slots = await screen.findAllByTitle(/huecos disponibles/i);
      fireEvent.click(slots[0]);
    
      await waitFor(() => {
        expect(slots[0].className).toContain('selected');
      });
    });

    it("should disable unavailable slots", async () => {
      const facilityMock = {
        _id: '1',
        name: 'Pista 1',
        priceForHalfHour: 20,
        capacity: 3,
        schedule: {
          initialHour: '2025-04-01T09:00:00.000Z',
          endHour: '2025-04-01T10:00:00.000Z',
        }
      };
    
      const customSlots = [
        {
          time: '09:00',
          available: false,
          remaining: 0,
          date: new Date('2025-04-01T09:00:00.000Z'),
        },
        {
          time: '09:30',
          available: true,
          remaining: 3,
          date: new Date('2025-04-01T09:30:00.000Z'),
        },
      ];
    
      mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facilityMock]);
      mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facilityMock);
      mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);
    
      jest.spyOn(require('../../utils/facilities'), 'generateTimeSlots').mockResolvedValue(customSlots);
      render(<Facilities />);
    
      fireEvent.change(await screen.findByRole('combobox'), { target: { value: '1' } });
    
      const input = await screen.findByPlaceholderText(/Selecciona una fecha/i);
      fireEvent.click(input);
    
      const allDayButtons = await screen.findAllByText("1");
      const validDay = allDayButtons.find(el => el.getAttribute("aria-disabled") !== "true");
      fireEvent.click(validDay);
    
      const slotButtons = await screen.findAllByRole('button', { name: /09:/i });
    
      expect(slotButtons[0]).toBeDisabled();
      expect(slotButtons[0].className).toMatch(/unavailable/);
    
      expect(slotButtons[1]).not.toBeDisabled();
      expect(slotButtons[1].className).toMatch(/available/);
    });
    

        // it("muestra error si no se ha seleccionado una fecha antes de reservar", async () => {
    //   const facilityMock = {
    //     _id: '1',
    //     name: 'Pista 1',
    //     priceForHalfHour: 20,
    //     capacity: 3,
    //     schedule: {
    //       initialHour: '2025-04-01T09:00:00.000Z',
    //       endHour: '2025-04-01T11:00:00.000Z',
    //     }
    //   };
    
    //   mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([facilityMock]);
    //   mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue(facilityMock);
    
    //   render(<Facilities />);
    
    //   fireEvent.change(await screen.findByRole('combobox'), { target: { value: '1' } });
    
    //   // Esperamos a que el botón esté presente
    //   const submitBtn = await screen.findByRole('button', { name: /Reservar/i });
    
    //   jest.clearAllMocks();
    //   fireEvent.click(submitBtn);
    
    //   await waitFor(() => {
    //     expect(toast.error).toHaveBeenCalledWith('Por favor, selecciona una fecha de inicio.');
    //   });
  });
});
