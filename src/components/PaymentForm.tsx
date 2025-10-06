import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentFormProps {
  projectId: string;
  amount: number;
  designerName: string;
  projectTitle: string;
}

const PaymentForm = ({ projectId, amount, designerName, projectTitle }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'final_payment'>('deposit');
  const { toast } = useToast();

  // Calculate commission (10%)
  const commissionRate = 10;
  const commissionAmount = (amount * commissionRate) / 100;
  const designerAmount = amount - commissionAmount;

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to make a payment",
          variant: "destructive",
        });
        return;
      }

      // Call the payment processing edge function
      const { data, error } = await supabase.functions.invoke('process_payment_2025_09_30_12_43', {
        body: {
          projectId,
          amount,
          paymentType
        }
      });

      if (error) {
        throw error;
      }

      // Initialize Stripe (in a real app, you'd load this from your environment)
      const stripe = (window as any).Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (stripeError) {
        throw stripeError;
      }

      toast({
        title: "Payment Initiated",
        description: "Your payment is being processed securely",
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Pay {designerName} for "{projectTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Type Selection */}
        <div className="space-y-3">
          <Label>Payment Type</Label>
          <div className="flex gap-2">
            <Button
              variant={paymentType === 'deposit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentType('deposit')}
            >
              Deposit (50%)
            </Button>
            <Button
              variant={paymentType === 'final_payment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentType('final_payment')}
            >
              Final Payment
            </Button>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Project Amount:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Platform Fee (10%):</span>
            <span>-${commissionAmount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Designer Receives:</span>
              <span className="text-primary">${designerAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>Secured by Stripe • Escrow Protection</span>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          By clicking "Pay", you agree to our terms of service and privacy policy.
          Funds will be held in escrow until project completion.
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;